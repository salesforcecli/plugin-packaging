/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import {
  Flags,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Lifecycle, Messages } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { Package1Version, PackageVersionEvents, PackagingSObjects } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package1_version_create');

type PackageUploadRequest = PackagingSObjects.PackageUploadRequest;

export class Package1VersionCreateCommand extends SfCommand<PackageUploadRequest> {
  public static readonly summary = messages.getMessage('cliDescription');
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresProject = true;
  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    packageid: Flags.salesforceId({
      char: 'i',
      summary: messages.getMessage('id'),
      description: messages.getMessage('idLong'),
      required: true,
    }),
    name: Flags.string({
      char: 'n',
      summary: messages.getMessage('name'),
      description: messages.getMessage('nameLong'),
      required: true,
    }),
    description: Flags.string({
      char: 'd',
      summary: messages.getMessage('description'),
      description: messages.getMessage('descriptionLong'),
    }),
    version: Flags.string({
      char: 'v',
      summary: messages.getMessage('version'),
      description: messages.getMessage('versionLong'),
    }),
    managedreleased: Flags.boolean({
      char: 'm',
      summary: messages.getMessage('managedReleased'),
      description: messages.getMessage('managedReleasedLong'),
    }),
    releasenotesurl: Flags.url({
      char: 'r',
      summary: messages.getMessage('releaseNotes'),
      description: messages.getMessage('releaseNotesLong'),
    }),
    postinstallurl: Flags.url({
      char: 'p',
      summary: messages.getMessage('postInstall'),
      description: messages.getMessage('postInstallLong'),
    }),
    installationkey: Flags.string({
      char: 'k',
      summary: messages.getMessage('installationKey'),
      description: messages.getMessage('installationKeyLong'),
    }),
    wait: Flags.duration({
      unit: 'minutes',
      char: 'w',
      summary: messages.getMessage('wait'),
      description: messages.getMessage('waitLong'),
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
        MetadataPackageId: flags.packageid,
        VersionName: flags.name,
        Description: flags.description,
        MajorVersion: version.major,
        MinorVersion: version.minor,
        IsReleaseVersion: flags.managedreleased,
        ReleaseNotesUrl: flags.releasenotesurl as unknown as string,
        PostInstallUrl: flags.postinstallurl as unknown as string,
        Password: flags.installationkey,
      },
      { frequency: Duration.seconds(5), timeout: flags.wait ?? Duration.seconds(0) }
    );

    const arg =
      result.Status === 'SUCCESS' ? [result.MetadataPackageVersionId] : [result.Id, flags['target-org'].getUsername()];
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
