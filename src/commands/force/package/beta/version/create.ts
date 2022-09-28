/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Duration, camelCaseToTitleCase } from '@salesforce/kit';
import { Lifecycle, Messages } from '@salesforce/core';
import {
  getPackageIdFromAlias,
  INSTALL_URL_BASE,
  PackageVersion,
  PackageVersionCreateReportProgress,
  PackageVersionCreateRequestResult,
  PackageVersionEvents,
  PackagingSObjects,
} from '@salesforce/packaging';
import Package2VersionStatus = PackagingSObjects.Package2VersionStatus;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create');

export class PackageVersionCreateCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresDevhubUsername = true;
  public static readonly requiresProject = true;
  public static readonly flagsConfig: FlagsConfig = {
    branch: flags.string({
      char: 'b',
      description: messages.getMessage('branch'),
      longDescription: messages.getMessage('longBranch'),
    }),
    buildinstance: flags.string({
      char: 's',
      description: messages.getMessage('instance'),
      longDescription: messages.getMessage('longInstance'),
      hidden: true,
    }),
    codecoverage: flags.boolean({
      char: 'c',
      description: messages.getMessage('codeCoverage'),
      longDescription: messages.getMessage('longCodeCoverage'),
      default: false,
      exclusive: ['skipvalidation'],
    }),
    definitionfile: flags.filepath({
      char: 'f',
      description: messages.getMessage('definitionfile'),
      longDescription: messages.getMessage('longDefinitionfile'),
    }),
    installationkey: flags.string({
      char: 'k',
      description: messages.getMessage('key'),
      longDescription: messages.getMessage('longKey'),
      exactlyOne: ['installationkey', 'installationkeybypass'],
    }),
    installationkeybypass: flags.boolean({
      char: 'x',
      description: messages.getMessage('keyBypass'),
      longDescription: messages.getMessage('longKeyBypass'),
      exactlyOne: ['installationkey', 'installationkeybypass'],
    }),
    package: flags.string({
      char: 'p',
      description: messages.getMessage('package'),
      longDescription: messages.getMessage('longPackage', []),
      exactlyOne: ['path', 'package'],
    }),
    path: flags.directory({
      char: 'd',
      description: messages.getMessage('path'),
      longDescription: messages.getMessage('longPath'),
      exactlyOne: ['path', 'package'],
      validate: (dir) => {
        if (!fs.existsSync(path.join(process.cwd(), dir))) {
          throw messages.createError('errorPathNotFound', [dir]);
        }
        return true;
      },
    }),
    postinstallscript: flags.string({
      description: messages.getMessage('postInstallScript'),
      longDescription: messages.getMessage('postInstallScriptLong'),
    }),
    postinstallurl: flags.url({
      description: messages.getMessage('postInstallUrl'),
      longDescription: messages.getMessage('postInstallUrlLong'),
    }),
    preserve: flags.boolean({
      char: 'r',
      description: messages.getMessage('preserve'),
      longDescription: messages.getMessage('longPreserve'),
      hidden: true,
    }),
    releasenotesurl: flags.url({
      description: messages.getMessage('releaseNotesUrl'),
      longDescription: messages.getMessage('releaseNotesUrlLong'),
    }),
    skipancestorcheck: flags.boolean({
      description: messages.getMessage('skipAncestorCheck'),
      longDescription: messages.getMessage('skipAncestorCheckLong'),
      default: false,
    }),
    skipvalidation: flags.boolean({
      description: messages.getMessage('skipValidation'),
      longDescription: messages.getMessage('skipValidationLong'),
      default: false,
      exclusive: ['codecoverage'],
    }),
    tag: flags.string({
      char: 't',
      description: messages.getMessage('tag'),
      longDescription: messages.getMessage('longTag'),
    }),
    uninstallscript: flags.string({
      description: messages.getMessage('uninstallScript'),
      longDescription: messages.getMessage('uninstallScriptLong'),
    }),
    validateschema: flags.boolean({
      char: 'j',
      description: messages.getMessage('validateschema'),
      longDescription: messages.getMessage('longValidateschema'),
      hidden: true,
    }),
    versiondescription: flags.string({
      char: 'e',
      description: messages.getMessage('versiondescription'),
      longDescription: messages.getMessage('longVersiondescription'),
    }),
    versionname: flags.string({
      char: 'a',
      description: messages.getMessage('versionname'),
      longDescription: messages.getMessage('longVersionname'),
    }),
    versionnumber: flags.string({
      char: 'n',
      description: messages.getMessage('versionnumber'),
      longDescription: messages.getMessage('longVersionnumber'),
    }),
    wait: flags.minutes({
      char: 'w',
      description: messages.getMessage('wait'),
      longDescription: messages.getMessage('longWait'),
      default: Duration.minutes(0),
    }),
  };

  public async run(): Promise<Partial<PackageVersionCreateRequestResult>> {
    if (this.flags.skipvalidation) {
      this.ux.warn(messages.getMessage('skipValidationWarning'));
    }
    const frequency = this.flags.wait && this.flags.skipvalidation ? Duration.seconds(5) : Duration.seconds(30);
    Lifecycle.getInstance().on(
      PackageVersionEvents.create.progress,
      // no async methods
      // eslint-disable-next-line @typescript-eslint/require-await
      async (data: PackageVersionCreateReportProgress) => {
        if (data.Status !== Package2VersionStatus.success && data.Status !== Package2VersionStatus.error) {
          this.ux.setSpinnerStatus(
            messages.getMessage('packageVersionCreateWaitingStatus', [data.remainingWaitTime.minutes, data.Status])
          );
        }
      }
    );
    Lifecycle.getInstance().on(
      PackageVersionEvents.create['preserve-files'],
      // eslint-disable-next-line @typescript-eslint/require-await
      async (data: { location: string; message: string }) => {
        this.ux.log(messages.getMessage('tempFileLocation', [data.location]));
      }
    );

    // resolve the package id from the --package flag, first checking if it's an alias, then using the flag (an id), and then looking for the package name from the --path flag
    let packageName: string;
    if (this.flags.package) {
      // we're unable to type this earlier, because casting `undefined as string` will result in "", which would screw up the logic below
      const pkg = this.flags.package as string;
      packageName = pkg.startsWith('0ho') ? pkg : getPackageIdFromAlias(pkg, this.project);
    } else {
      // due to flag validation, we'll either have a package or path flag
      packageName = this.project.getPackageFromPath(this.flags.path).package;
    }

    const packageId = getPackageIdFromAlias(packageName, this.project);

    const pv = new PackageVersion({ project: this.project, connection: this.hubOrg.getConnection() });
    this.ux.startSpinner(messages.getMessage('requestInProgress'));
    const result = await pv.create(
      { ...this.flags, ...{ packageId } },
      {
        timeout: this.flags.wait as Duration,
        frequency,
      }
    );
    this.ux.stopSpinner(messages.getMessage('packageVersionCreateFinalStatus', [result.Status]));
    switch (result.Status) {
      case 'Error':
        throw messages.createError('unknownError', [result.Error.join('\n')]);
      case 'Success':
        this.ux.log(
          messages.getMessage(result.Status, [
            result.Id,
            result.SubscriberPackageVersionId,
            INSTALL_URL_BASE.toString(),
            result.SubscriberPackageVersionId,
          ])
        );
        break;
      default:
        this.ux.log(messages.getMessage('InProgress', [camelCaseToTitleCase(result.Status), result.Id]));
    }
    return result;
  }
}
