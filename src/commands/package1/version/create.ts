/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package1_version_create');

export type PackageUploadRequest = PackagingSObjects.PackageUploadRequest;

export class Package1VersionCreateCommand extends SfCommand<PackageUploadRequest> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package1:beta:version:create', 'force:package1:version:create'];

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    'package-id': Flags.salesforceId({
      length: 'both',
      deprecateAliases: true,
      aliases: ['packageid'],
      char: 'i',
      summary: messages.getMessage('id'),
      description: messages.getMessage('id-long'),
      required: true,
      startsWith: '033',
    }),
    name: Flags.string({
      char: 'n',
      summary: messages.getMessage('name'),
      description: messages.getMessage('name-long'),
      required: true,
    }),
    description: Flags.string({
      char: 'd',
      summary: messages.getMessage('description'),
      description: messages.getMessage('description-long'),
    }),
    version: Flags.string({
      char: 'v',
      summary: messages.getMessage('version'),
      description: messages.getMessage('version-long'),
    }),
    'managed-released': Flags.boolean({
      char: 'm',
      deprecateAliases: true,
      aliases: ['managedrelease'],
      summary: messages.getMessage('managed-release'),
      description: messages.getMessage('managed-release-long'),
    }),
    'release-notes-url': Flags.string({
      char: 'r',
      deprecateAliases: true,
      aliases: ['releasenotesurl'],
      summary: messages.getMessage('release-notes'),
      description: messages.getMessage('release-notes-long'),
    }),
    'post-install-url': Flags.string({
      char: 'p',
      deprecateAliases: true,
      aliases: ['postinstallurl'],
      summary: messages.getMessage('post-install'),
      description: messages.getMessage('post-install-long'),
    }),
    'installation-key': Flags.string({
      char: 'k',
      deprecateAliases: true,
      aliases: ['installationkey'],
      summary: messages.getMessage('installation-key'),
      description: messages.getMessage('installation-key-long'),
    }),
    wait: Flags.duration({
      unit: 'minutes',
      char: 'w',
      summary: messages.getMessage('wait'),
      description: messages.getMessage('wait-long'),
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
