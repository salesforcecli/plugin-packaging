/*
 * Copyright 2025, Salesforce, Inc.
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

import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Lifecycle, Messages } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { Package1Version, PackageVersionEvents, PackagingSObjects } from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package1_version_create');

export type PackageUploadRequest = PackagingSObjects.PackageUploadRequest;

export class Package1VersionCreateCommand extends SfCommand<PackageUploadRequest> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package1:version:create'];

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    'package-id': Flags.salesforceId({
      length: 'both',
      deprecateAliases: true,
      aliases: ['packageid'],
      char: 'i',
      summary: messages.getMessage('flags.package-id.summary'),
      required: true,
      startsWith: '033',
    }),
    name: Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.name.summary'),
      required: true,
    }),
    description: Flags.string({
      char: 'd',
      summary: messages.getMessage('flags.description.summary'),
    }),
    version: Flags.string({
      char: 'v',
      summary: messages.getMessage('flags.version.summary'),
    }),
    'managed-released': Flags.boolean({
      char: 'm',
      deprecateAliases: true,
      aliases: ['managedrelease'],
      summary: messages.getMessage('flags.managed-released.summary'),
      description: messages.getMessage('flags.managed-released.description'),
    }),
    'release-notes-url': Flags.string({
      char: 'r',
      deprecateAliases: true,
      aliases: ['releasenotesurl'],
      summary: messages.getMessage('flags.release-notes-url.summary'),
      description: messages.getMessage('flags.release-notes-url.description'),
    }),
    'post-install-url': Flags.string({
      char: 'p',
      deprecateAliases: true,
      aliases: ['postinstallurl'],
      summary: messages.getMessage('flags.post-install-url.summary'),
      description: messages.getMessage('flags.post-install-url.description'),
    }),
    'installation-key': Flags.string({
      char: 'k',
      deprecateAliases: true,
      aliases: ['installationkey'],
      summary: messages.getMessage('flags.installation-key.summary'),
    }),
    wait: Flags.duration({
      unit: 'minutes',
      char: 'w',
      summary: messages.getMessage('flags.wait.summary'),
    }),
  };

  public async run(): Promise<PackageUploadRequest> {
    const { flags } = await this.parse(Package1VersionCreateCommand);
    const version = this.parseVersion(flags.version as string);
    if (flags.wait) {
      // if we're waiting for the request, set up the listener
      Lifecycle.getInstance().on(
        PackageVersionEvents.create.progress,
        // the 'on' method requires an async method, but we don't have any async calls
        // eslint-disable-next-line @typescript-eslint/require-await
        async (data: { timeout: number; pollingResult: PackageUploadRequest }) => {
          this.log(
            `Package upload is ${data.pollingResult.Status === 'QUEUED' ? 'enqueued' : 'in progress'}. Waiting ${
              data.timeout
            } more seconds`
          );
        }
      );
    }
    const result = await Package1Version.create(
      flags['target-org'].getConnection(flags['api-version']),
      {
        MetadataPackageId: flags['package-id'],
        VersionName: flags.name,
        Description: flags.description,
        MajorVersion: version.major,
        MinorVersion: version.minor,
        IsReleaseVersion: flags['managed-released'],
        ReleaseNotesUrl: flags['release-notes-url'],
        PostInstallUrl: flags['post-install-url'],
        Password: flags['installation-key'],
      },
      { frequency: Duration.seconds(5), timeout: flags.wait ?? Duration.seconds(0) }
    );

    const arg =
      result.Status === 'SUCCESS'
        ? [result.MetadataPackageVersionId]
        : [this.config.bin, result.Id, flags['target-org'].getUsername()];
    this.log(messages.getMessage(result.Status, arg));

    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  private parseVersion(versionString: string): { major: number | undefined; minor: number | undefined } {
    const versions = versionString?.split('.');
    if (!versions) {
      // return nulls so when no version flag is provided, the server can infer the correct version
      return { major: undefined, minor: undefined };
    }

    if (versions.length === 2) {
      return {
        major: Number(versions[0]),
        minor: Number(versions[1]),
      };
    } else {
      throw messages.createError('package1VersionCreateCommandInvalidVersion', [versionString]);
    }
  }
}
