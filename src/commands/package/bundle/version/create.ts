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

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import {
  BundleVersionCreateOptions,
  BundleSObjects,
  PackageBundleVersion,
  PackageVersionEvents,
} from '@salesforce/packaging';
import { Messages, Lifecycle } from '@salesforce/core';
import { camelCaseToTitleCase, Duration } from '@salesforce/kit';
import { requiredHubFlag } from '../../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
// TODO: Update messages
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_version_create');
export type BundleVersionCreate = BundleSObjects.PackageBundleVersionCreateRequestResult;

/**
 * Converts a 15-character Salesforce ID to its 18-character equivalent.
 * If the ID is already 18 characters or not a valid Salesforce ID format, returns it unchanged.
 *
 * @param id - The Salesforce ID to convert
 * @returns The 18-character Salesforce ID
 */
function convertTo18CharId(id: string): string {
  // If already 18 chars or not 15 chars, return as-is
  if (!id || id.length !== 15) {
    return id;
  }

  // Salesforce ID conversion algorithm
  // For each chunk of 5 characters, calculate a checksum character
  const suffix: string[] = [];

  for (let i = 0; i < 3; i++) {
    let flags = 0;
    for (let j = 0; j < 5; j++) {
      const char = id.charAt(i * 5 + j);
      // Check if character is uppercase (A-Z have higher ASCII values than lowercase)
      if (char >= 'A' && char <= 'Z') {
        flags += 1 << j;
      }
    }
    // Convert flags to a base-32 character
    suffix.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ012345'.charAt(flags));
  }

  return id + suffix.join('');
}

/**
 * Normalizes package version IDs in a bundle definition object.
 * Converts any 15-character package version IDs to 18-character format.
 *
 * @param obj - The object to normalize (can be nested)
 * @returns The normalized object
 */
function normalizePackageVersionIds(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => normalizePackageVersionIds(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'packageVersion' && typeof value === 'string' && value.startsWith('04t')) {
      // Normalize package version IDs (04t prefix)
      result[key] = convertTo18CharId(value);
    } else if (typeof value === 'object') {
      result[key] = normalizePackageVersionIds(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export class PackageBundlesCreate extends SfCommand<BundleSObjects.PackageBundleVersionCreateRequestResult> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static readonly flags = {
    loglevel,
    bundle: Flags.string({
      char: 'b',
      summary: messages.getMessage('flags.bundle.summary'),
      required: true,
    }),
    description: Flags.string({
      char: 'd',
      summary: messages.getMessage('flags.description.summary'),
    }),
    'definition-file': Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.definition-file.summary'),
      required: true,
    }),
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    wait: Flags.integer({
      char: 'w',
      summary: messages.getMessage('flags.wait.summary'),
      default: 0,
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
    'version-number': Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.version-number.summary'),
    }),
  };

  public async run(): Promise<BundleSObjects.PackageBundleVersionCreateRequestResult> {
    const { flags } = await this.parse(PackageBundlesCreate);

    // Parse version number if provided
    let majorVersion = '';
    let minorVersion = '';
    if (flags['version-number']) {
      const versionParts = flags['version-number'].split('.');
      majorVersion = versionParts[0] || '';
      minorVersion = versionParts[1] || '';
    }

    // Read and normalize the definition file to handle 15-char package version IDs
    const { definitionFilePath, tempFilePath } = await this.normalizeDefinitionFile(flags['definition-file']);

    const options: BundleVersionCreateOptions = {
      connection: flags['target-dev-hub'].getConnection(flags['api-version']),
      project: this.project!,
      PackageBundle: flags.bundle,
      BundleVersionComponentsPath: definitionFilePath,
      Description: flags.description,
      MajorVersion: majorVersion,
      MinorVersion: minorVersion,
      Ancestor: '',
    };

    Lifecycle.getInstance().on(
      PackageVersionEvents.create.progress,
      // no async methods
      // eslint-disable-next-line @typescript-eslint/require-await
      async (data: BundleSObjects.PackageBundleVersionCreateRequestResult & { remainingWaitTime: Duration }) => {
        if (
          data.RequestStatus !== BundleSObjects.PkgBundleVersionCreateReqStatus.success &&
          data.RequestStatus !== BundleSObjects.PkgBundleVersionCreateReqStatus.error
        ) {
          const status = messages.getMessage('bundleVersionCreateWaitingStatus', [
            data.remainingWaitTime.minutes,
            data.RequestStatus,
          ]);
          if (flags.verbose) {
            this.log(status);
          } else {
            this.spinner.status = status;
          }
        }
      }
    );

    // Start spinner if polling is enabled and not in verbose mode
    const isSpinnerRunning = flags.wait && flags.wait > 0 && !flags.verbose;
    if (isSpinnerRunning) {
      this.spinner.start('Creating bundle version...');
    }

    let result: BundleSObjects.PackageBundleVersionCreateRequestResult;
    try {
      result = await PackageBundleVersion.create({
        ...options,
        ...(flags.wait && flags.wait > 0
          ? { polling: { timeout: Duration.minutes(flags.wait), frequency: Duration.seconds(5) } }
          : undefined),
      });
    } catch (error) {
      // Stop spinner on error
      if (isSpinnerRunning) {
        this.spinner.stop();
      }
      throw error;
    } finally {
      await this.cleanupTempFile(tempFilePath);
    }

    if (isSpinnerRunning) {
      this.spinner.stop();
    }

    this.handleResult(result);
    return result;
  }

  private async normalizeDefinitionFile(
    definitionFilePath: string
  ): Promise<{ definitionFilePath: string; tempFilePath?: string }> {
    try {
      const definitionContent = await fs.promises.readFile(definitionFilePath, 'utf8');
      const definitionJson = JSON.parse(definitionContent) as unknown;
      const normalizedJson = normalizePackageVersionIds(definitionJson);

      if (JSON.stringify(definitionJson) !== JSON.stringify(normalizedJson)) {
        const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'sf-bundle-'));
        const tempFilePath = path.join(tempDir, 'normalized-definition.json');
        await fs.promises.writeFile(tempFilePath, JSON.stringify(normalizedJson, null, 2), 'utf8');
        this.debug(`Normalized package version IDs in definition file. Using temporary file: ${tempFilePath}`);
        return { definitionFilePath: tempFilePath, tempFilePath };
      }
    } catch (error) {
      this.debug(`Could not normalize definition file: ${error instanceof Error ? error.message : String(error)}`);
    }
    return { definitionFilePath };
  }

  private async cleanupTempFile(tempFilePath: string | undefined): Promise<void> {
    if (tempFilePath) {
      try {
        const tempDir = path.dirname(tempFilePath);
        await fs.promises.rm(tempDir, { recursive: true, force: true });
        this.debug(`Cleaned up temporary definition file: ${tempFilePath}`);
      } catch (cleanupError) {
        this.debug(
          `Failed to clean up temporary file: ${
            cleanupError instanceof Error ? cleanupError.message : String(cleanupError)
          }`
        );
      }
    }
  }

  private handleResult(result: BundleSObjects.PackageBundleVersionCreateRequestResult): void {
    switch (result.RequestStatus) {
      case BundleSObjects.PkgBundleVersionCreateReqStatus.error: {
        const errorMessages: string[] = [];

        if (result.Error && result.Error.length > 0) {
          errorMessages.push(...result.Error);
        }

        if (result.ValidationError) {
          errorMessages.push(result.ValidationError);
        }

        const errorText =
          errorMessages.length > 0 ? errorMessages.join('\n') : 'Unknown error occurred during bundle version creation';

        throw messages.createError('multipleErrors', [errorText]);
      }
      case BundleSObjects.PkgBundleVersionCreateReqStatus.success: {
        const displayId = result.PackageBundleVersionId || result.Id;
        this.log(`Successfully created bundle version with ID ${displayId}`);
        break;
      }
      default:
        this.log(messages.getMessage('InProgress', [camelCaseToTitleCase(result.RequestStatus as string), result.Id]));
    }
  }
}
