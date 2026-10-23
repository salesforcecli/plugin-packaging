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
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Org } from '@salesforce/core';
import { expect } from 'chai';
import {
  CACHE_TTL_MS,
  findOrgFlag,
  fetchNotice,
  lookupNotice,
  type NoticeDeps,
  parseNotice,
  printPendingNotice,
  shouldSkip,
  startNoticeLookup,
} from '../../src/utils/packagingEnforcement.js';

const ORG_ID = '00Dxx0000000001EAA';
const INSTANCE = 'https://example.my.salesforce.com';
const NOW = 1_000_000;

const b64 = (text: string): string => Buffer.from(text, 'utf8').toString('base64url');
const header = (level: string, message: string): string => `level=${level}; msg="${b64(message)}"`;

function fakeOrg(orgId = ORG_ID): Org {
  return {
    getOrgId: () => orgId,
    getConnection: () => ({
      getConnectionOptions: () => ({ accessToken: 'tok', instanceUrl: INSTANCE }),
      getApiVersion: () => '66.0',
    }),
  } as unknown as Org;
}

/** Records requests. `reply` returns a Response, throws, or never settles when `hang` is set. */
function fakeFetch(reply: () => Response | Promise<Response>, hang = false) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fetcher = ((url: string, init: RequestInit) => {
    calls.push({ url, init });
    if (hang) {
      return new Promise<Response>((_, reject) => {
        init.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      });
    }
    return Promise.resolve(reply());
  }) as typeof fetch;
  return { fetch: fetcher, calls };
}

describe('packaging enforcement notice utility', () => {
  let dir: string;
  let cacheFile: string;
  let now: number;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'pp-enforcement-'));
    cacheFile = join(dir, 'cache.json');
    now = NOW;
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  function deps(overrides: Partial<NoticeDeps> = {}): NoticeDeps {
    return {
      resolveAlias: async () => 'myorg',
      createOrg: async () => fakeOrg(),
      fetch: fakeFetch(() => new Response(null, { status: 200 })).fetch,
      cacheFile,
      now: () => now,
      timeoutMs: 1000,
      ...overrides,
    };
  }

  describe('parseNotice', () => {
    it('decodes level and message from a well-formed header', () => {
      expect(parseNotice(header('E0', 'Nothing is blocked.'))).to.deep.equal({
        level: 'E0',
        message: 'Nothing is blocked.',
      });
    });

    it('returns undefined when the header is absent or malformed', () => {
      expect(parseNotice(null)).to.equal(undefined);
      expect(parseNotice('')).to.equal(undefined);
      expect(parseNotice('level=E0')).to.equal(undefined);
      expect(parseNotice('level=E0; msg="not base64url!"')).to.equal(undefined);
    });

    it('round-trips quotes, semicolons, equals signs and non-ASCII text', () => {
      const tricky = 'say "hi"; level=E9 é中';
      expect(parseNotice(header('E1', tricky))?.message).to.equal(tricky);
    });
  });

  describe('shouldSkip and findOrgFlag', () => {
    it('skips machine-readable output', () => {
      expect(shouldSkip(['package', 'install', '--json'])).to.equal(true);
      expect(shouldSkip(['package', 'install'])).to.equal(false);
    });

    it('reads the org alias from every supported flag form', () => {
      expect(findOrgFlag(['-o', 'alpha'])).to.equal('alpha');
      expect(findOrgFlag(['--target-org', 'beta'])).to.equal('beta');
      expect(findOrgFlag(['--target-org=gamma'])).to.equal('gamma');
      expect(findOrgFlag(['-o=delta'])).to.equal('delta');
    });

    it('returns undefined when no value follows the flag or args end at --', () => {
      expect(findOrgFlag([])).to.equal(undefined);
      expect(findOrgFlag(['--target-org'])).to.equal(undefined);
      expect(findOrgFlag(['--target-org', '--json'])).to.equal(undefined);
      expect(findOrgFlag(['--', '-o', 'x'])).to.equal(undefined);
    });
  });

  describe('lookupNotice', () => {
    it('does no org or network work for --json', async () => {
      let created = false;
      const f = fakeFetch(() => new Response(null, { status: 200 }));
      const result = await lookupNotice(['--json'], deps({ createOrg: async () => ((created = true), fakeOrg()), fetch: f.fetch }));
      expect(result).to.equal(undefined);
      expect(created).to.equal(false);
      expect(f.calls).to.have.length(0);
    });

    it('does nothing when no org resolves', async () => {
      let created = false;
      const result = await lookupNotice([], deps({ resolveAlias: async () => undefined, createOrg: async () => ((created = true), fakeOrg()) }));
      expect(result).to.equal(undefined);
      expect(created).to.equal(false);
    });

    it('returns the notice and sends the bearer token to the version root', async () => {
      const f = fakeFetch(() => new Response(null, { status: 200, headers: { 'sforce-packaging-enforcement': header('E1', 'Blocked.') } }));
      const result = await lookupNotice([], deps({ fetch: f.fetch }));
      expect(result).to.deep.equal({ level: 'E1', message: 'Blocked.' });
      expect(f.calls[0]?.url).to.equal(`${INSTANCE}/services/data/v66.0/`);
      expect((f.calls[0]?.init.headers as Record<string, string>).Authorization).to.equal('Bearer tok');
    });

    it('serves a repeat run from the disk cache without a request', async () => {
      const first = fakeFetch(() => new Response(null, { status: 200, headers: { 'sforce-packaging-enforcement': header('E0', 'Notice.') } }));
      await lookupNotice([], deps({ fetch: first.fetch }));
      const second = fakeFetch(() => new Response(null, { status: 200 }));
      const result = await lookupNotice([], deps({ fetch: second.fetch }));
      expect(result).to.deep.equal({ level: 'E0', message: 'Notice.' });
      expect(second.calls).to.have.length(0);
    });

    it('caches a "not enrolled" result so unenrolled orgs are not re-checked each run', async () => {
      const first = fakeFetch(() => new Response(null, { status: 200 }));
      expect(await lookupNotice([], deps({ fetch: first.fetch }))).to.equal(undefined);
      const second = fakeFetch(() => new Response(null, { status: 200 }));
      expect(await lookupNotice([], deps({ fetch: second.fetch }))).to.equal(undefined);
      expect(second.calls).to.have.length(0);
    });

    it('refetches once the cache entry has expired', async () => {
      await lookupNotice([], deps({ fetch: fakeFetch(() => new Response(null, { status: 200 })).fetch }));
      now += CACHE_TTL_MS + 1;
      const later = fakeFetch(() => new Response(null, { status: 200, headers: { 'sforce-packaging-enforcement': header('E0', 'Back.') } }));
      expect(await lookupNotice([], deps({ fetch: later.fetch }))).to.deep.equal({ level: 'E0', message: 'Back.' });
      expect(later.calls).to.have.length(1);
    });

    it('treats a corrupt cache file as empty', async () => {
      await writeFile(cacheFile, '{not json', 'utf8');
      const f = fakeFetch(() => new Response(null, { status: 200 }));
      await lookupNotice([], deps({ fetch: f.fetch }));
      expect(f.calls).to.have.length(1);
      expect(JSON.parse(await readFile(cacheFile, 'utf8'))).to.have.property(ORG_ID);
    });

    it('fails open on non-200 responses and does not cache them', async () => {
      const statuses = [401, 404, 500];
      const notices = await Promise.all(
        statuses.map((status) => {
          const f = fakeFetch(() => new Response(null, { status, headers: { 'sforce-packaging-enforcement': header('E1', 'x') } }));
          return lookupNotice([], deps({ fetch: f.fetch }));
        })
      );
      statuses.forEach((status, i) => expect(notices[i], `status ${status}`).to.equal(undefined));
      const retry = fakeFetch(() => new Response(null, { status: 200 }));
      await lookupNotice([], deps({ fetch: retry.fetch }));
      expect(retry.calls, 'failures must not be cached').to.have.length(1);
    });

    it('fails open on a network error', async () => {
      const f = fakeFetch(() => {
        throw new TypeError('fetch failed');
      });
      expect(await lookupNotice([], deps({ fetch: f.fetch }))).to.equal(undefined);
    });

    it('fails open on timeout', async () => {
      const f = fakeFetch(() => new Response(null, { status: 200 }), true);
      expect(await lookupNotice([], deps({ fetch: f.fetch, timeoutMs: 10 }))).to.equal(undefined);
    });

    it('fails open when the org cannot be created', async () => {
      const result = await lookupNotice([], deps({ createOrg: async () => Promise.reject(new Error('no auth')) }));
      expect(result).to.equal(undefined);
    });
  });

  describe('fetchNotice', () => {
    it('distinguishes not-enrolled (null) from failure (undefined)', async () => {
      const ok = fakeFetch(() => new Response(null, { status: 200 }));
      expect(await fetchNotice({ fetch: ok.fetch, timeoutMs: 1000 }, INSTANCE, '66.0', 'tok')).to.equal(null);
      const bad = fakeFetch(() => new Response(null, { status: 404 }));
      expect(await fetchNotice({ fetch: bad.fetch, timeoutMs: 1000 }, INSTANCE, '66.0', 'tok')).to.equal(undefined);
    });
  });

  describe('printPendingNotice', () => {
    it('prints the notice once after the command, even when the command body failed', async () => {
      startNoticeLookup([], deps({ fetch: fakeFetch(() => new Response(null, { status: 200, headers: { 'sforce-packaging-enforcement': header('E0', 'Heads up.') } })).fetch }));
      const out: string[] = [];
      try {
        throw new Error('command failed');
      } catch {
        // command body failed; the finally hook still runs
      } finally {
        await printPendingNotice({ write: (chunk: string) => out.push(chunk) });
      }
      expect(out).to.deep.equal(['Heads up.\n']);
      await printPendingNotice({ write: (chunk: string) => out.push(chunk) });
      expect(out, 'second call must not print again').to.have.length(1);
    });

    it('prints nothing when the org has no notice', async () => {
      startNoticeLookup([], deps({ fetch: fakeFetch(() => new Response(null, { status: 200 })).fetch }));
      const out: string[] = [];
      await printPendingNotice({ write: (chunk: string) => out.push(chunk) });
      expect(out).to.deep.equal([]);
    });

    it('stops waiting after the wait budget and prints nothing for a slow lookup', async () => {
      startNoticeLookup([], deps({ fetch: fakeFetch(() => new Response(null, { status: 200 }), true).fetch, timeoutMs: 60_000 }));
      const out: string[] = [];
      const started = Date.now();
      await printPendingNotice({ write: (chunk: string) => out.push(chunk) }, 20);
      expect(Date.now() - started).to.be.lessThan(1000);
      expect(out).to.deep.equal([]);
    });

    it('does nothing when no lookup was started (help, unknown command)', async () => {
      const out: string[] = [];
      await printPendingNotice({ write: (chunk: string) => out.push(chunk) });
      expect(out).to.deep.equal([]);
    });
  });
});
