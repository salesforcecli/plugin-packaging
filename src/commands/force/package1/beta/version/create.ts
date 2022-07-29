/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Lifecycle, Messages } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { package1VersionCreate, PackagingSObjects } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package1_version_create');

export class Package1VersionCreateCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly longDescription = messages.getMessage('cliDescriptionLong');
  public static readonly help = messages.getMessage('cliHelp');
  public static readonly requiresUsername = true;
  public static readonly requiresProject = true;
  public static readonly flagsConfig: FlagsConfig = {
    packageid: flags.id({
      char: 'i',
      description: messages.getMessage('id'),
      longDescription: messages.getMessage('idLong'),
      required: true,
    }),
    name: flags.string({
      char: 'n',
      description: messages.getMessage('name'),
      longDescription: messages.getMessage('nameLong'),
      required: true,
    }),
    description: flags.string({
      char: 'd',
      description: messages.getMessage('description'),
      longDescription: messages.getMessage('descriptionLong'),
    }),
    version: flags.string({
      char: 'v',
      description: messages.getMessage('version'),
      longDescription: messages.getMessage('versionLong'),
    }),
    managedreleased: flags.boolean({
      char: 'm',
      description: messages.getMessage('managedReleased'),
      longDescription: messages.getMessage('managedReleasedLong'),
    }),
    releasenotesurl: flags.url({
      char: 'r',
      description: messages.getMessage('releaseNotes'),
      longDescription: messages.getMessage('releaseNotesLong'),
    }),
    postinstallurl: flags.url({
      char: 'p',
      description: messages.getMessage('postInstall'),
      longDescription: messages.getMessage('postInstallLong'),
    }),
    installationkey: flags.string({
      char: 'k',
      description: messages.getMessage('installationKey'),
      longDescription: messages.getMessage('installationKeyLong'),
    }),
    wait: flags.minutes({
      char: 'w',
      description: messages.getMessage('wait'),
      longDescription: messages.getMessage('waitLong'),
    }),
  };

  public async run(): Promise<PackagingSObjects.PackageUploadRequest> {
    const version = this.parseVersion(this.flags.version);
    if (this.flags.wait) {
      // if we're waiting for the request, set up the listener
      Lifecycle.getInstance().on(
        'package1VersionCreate:progress',
        // the 'on' method requires an async method, but we don't have any async calls
        // eslint-disable-next-line @typescript-eslint/require-await
        async (data: { timeout: number; pollingResult: PackagingSObjects.PackageUploadRequest }) => {
          this.ux.log(
            `Package upload is ${data.pollingResult.Status === 'QUEUED' ? 'enqueued' : 'in progress'}. Waiting ${
              data.timeout
            } more seconds`
          );
        }
      );
    }
    // TODO: remove ts-lint disable lines once packaging PR is published and types resolve
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
    const result: PackagingSObjects.PackageUploadRequest = await package1VersionCreate(
      this.org.getConnection(),
      {
        MetadataPackageId: this.flags.packageid as string,
        VersionName: this.flags.name as string,
        Description: this.flags.description as string,
        MajorVersion: version.major,
        MinorVersion: version.minor,
        IsReleaseVersion: this.flags.managedreleased as boolean,
        ReleaseNotesUrl: this.flags.releasenotesurl as string,
        PostInstallUrl: this.flags.postinstallurl as string,
        Password: this.flags.installationkey as string,
      },
      { frequency: Duration.seconds(5), timeout: (this.flags.wait as Duration) ?? Duration.seconds(0) }
    );

    const arg = result.Status === 'SUCCESS' ? [result.MetadataPackageVersionId] : [result.Id, this.org.getUsername()];
    this.ux.log(messages.getMessage(result.Status, arg));

    return result;
  }

  private parseVersion(versionString: string): { major: number; minor: number } {
    const versions = versionString?.split('.');
    if (!versions) {
      // return nulls so when no version flag is provided, the server can infer the correct version
      return { major: null, minor: null };
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
