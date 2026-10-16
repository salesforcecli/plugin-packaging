/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { ConfigAggregator, Org } from '@salesforce/core';

/** Response header the server sends on the REST version root when the org is enrolled. */
export const HEADER_NAME = 'sforce-packaging-enforcement';

/** How long a lookup result (notice or "no notice") is reused before the server is asked again. */
export const CACHE_TTL_MS = 60 * 60 * 1000;

/** Upper bound on the catalog GET. Past this the lookup fails open. */
export const FETCH_TIMEOUT_MS = 1500;

/** How long the finally hook waits for an in-flight lookup before giving up on printing. */
export const FINALLY_WAIT_MS = 1500;

export type Notice = {
  level: string;
  message: string;
};

/** Injectable collaborators, so the hooks can be tested without a live org or network. */
export type NoticeDeps = {
  resolveAlias: (argv: readonly string[]) => Promise<string | undefined>;
  createOrg: (alias: string) => Promise<Org>;
  fetch: typeof fetch;
  cacheFile: string;
  now: () => number;
  timeoutMs: number;
};

type CacheEntry = {
  /** `null` means the org was checked and has no notice. */
  notice: Notice | null;
  expiresAt: number;
};

type CacheFile = Record<string, CacheEntry>;

// `level=<LEVEL>; msg="<base64url>"`. The message is base64url so quotes, semicolons and non-ASCII
// text cannot break parsing. base64url never produces `"`, `;`, or `=` inside the quotes.
const HEADER_RE = /^level=([A-Z0-9]+); msg="([A-Za-z0-9_-]*)"$/;

/** Parses the header value, or returns `undefined` if it is absent or malformed. */
export function parseNotice(header: string | null | undefined): Notice | undefined {
  if (!header) return undefined;
  const match = HEADER_RE.exec(header.trim());
  if (!match) return undefined;
  const [, level, encoded] = match;
  if (level === undefined || encoded === undefined) return undefined;
  return { level, message: Buffer.from(encoded, 'base64url').toString('utf8') };
}

/** Machine-readable output must stay clean, so the notice is skipped for `--json`. */
export function shouldSkip(argv: readonly string[]): boolean {
  return argv.includes('--json');
}

/** The org alias from `-o`/`--target-org` in argv, or `undefined` if the flag is absent. */
export function findOrgFlag(argv: readonly string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--') return undefined;
    if (arg === undefined) continue;
    if (arg === '-o' || arg === '--target-org') {
      const value = argv[i + 1];
      return value && !value.startsWith('-') ? value : undefined;
    }
    if (arg.startsWith('--target-org=')) return arg.slice('--target-org='.length) || undefined;
    if (arg.startsWith('-o=')) return arg.slice('-o='.length) || undefined;
  }
  return undefined;
}

async function defaultResolveAlias(argv: readonly string[]): Promise<string | undefined> {
  const fromFlag = findOrgFlag(argv);
  if (fromFlag) return fromFlag;
  // Covers SF_TARGET_ORG and the configured default target-org.
  const aggregator = await ConfigAggregator.create();
  return aggregator.getPropertyValue<string>('target-org') ?? undefined;
}

export function defaultDeps(): NoticeDeps {
  return {
    resolveAlias: defaultResolveAlias,
    createOrg: (alias) => Org.create({ aliasOrUsername: alias }),
    fetch: globalThis.fetch,
    cacheFile: join(homedir(), '.sf', 'packaging-enforcement-cache.json'),
    now: Date.now,
    timeoutMs: FETCH_TIMEOUT_MS,
  };
}

/**
 * GETs the REST version root with the org's bearer token and reads the enforcement header.
 * Returns the notice, `null` when the org is not enrolled (200 with no header), or `undefined` on
 * any failure (non-200, network error, timeout). Failures are not cached, so they retry next run.
 */
export async function fetchNotice(
  deps: Pick<NoticeDeps, 'fetch' | 'timeoutMs'>,
  instanceUrl: string,
  apiVersion: string,
  accessToken: string
): Promise<Notice | null | undefined> {
  try {
    const response = await deps.fetch(`${instanceUrl}/services/data/v${apiVersion}/`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(deps.timeoutMs),
    });
    if (!response.ok) return undefined;
    return parseNotice(response.headers.get(HEADER_NAME)) ?? null;
  } catch {
    return undefined;
  }
}

async function readCache(file: string): Promise<CacheFile> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as CacheFile;
  } catch {
    return {};
  }
}

async function writeCache(file: string, orgId: string, notice: Notice | null, now: number): Promise<void> {
  try {
    const cache = await readCache(file);
    cache[orgId] = { notice, expiresAt: now + CACHE_TTL_MS };
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(cache), 'utf8');
  } catch {
    // Cache is an optimisation. A write failure only means the next run asks the server again.
  }
}

/**
 * Resolves the notice for the command's target org. Never rejects. Returns `undefined` when there
 * is nothing to show, including on every failure path (fail open).
 */
export async function lookupNotice(argv: readonly string[], deps: NoticeDeps): Promise<Notice | undefined> {
  try {
    if (shouldSkip(argv)) return undefined;
    const alias = await deps.resolveAlias(argv);
    if (!alias) return undefined;

    const org = await deps.createOrg(alias);
    const orgId = org.getOrgId();

    const cache = await readCache(deps.cacheFile);
    const entry = cache[orgId];
    if (entry && entry.expiresAt > deps.now()) return entry.notice ?? undefined;

    const connection = org.getConnection();
    const { accessToken, instanceUrl } = connection.getConnectionOptions();
    if (!accessToken || !instanceUrl) return undefined;

    const fetched = await fetchNotice(deps, instanceUrl, connection.getApiVersion(), accessToken);
    if (fetched === undefined) return undefined;

    await writeCache(deps.cacheFile, orgId, fetched, deps.now());
    return fetched ?? undefined;
  } catch {
    return undefined;
  }
}

let pending: Promise<Notice | undefined> | undefined;

/** Called from the prerun hook. Starts the lookup and does not wait for it. */
export function startNoticeLookup(argv: readonly string[], deps: NoticeDeps = defaultDeps()): void {
  pending = lookupNotice(argv, deps);
}

/**
 * Called from the finally hook, after the command body (and on failure). Waits at most
 * `waitMs` for the lookup, then prints the notice once on `out`.
 */
export async function printPendingNotice(
  out: { write(chunk: string): unknown } = process.stderr,
  waitMs = FINALLY_WAIT_MS
): Promise<void> {
  const lookup = pending;
  pending = undefined;
  if (!lookup) return;

  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<undefined>((resolve) => {
    timer = setTimeout(() => resolve(undefined), waitMs);
  });
  try {
    const notice = await Promise.race([lookup, timeout]);
    if (notice) out.write(`${notice.message}\n`);
  } finally {
    clearTimeout(timer);
  }
}
