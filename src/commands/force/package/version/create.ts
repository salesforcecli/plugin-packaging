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
import { camelCaseToTitleCase, Duration } from '@salesforce/kit';
import { Lifecycle, Messages } from '@salesforce/core';
import {
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
  public static aliases = ['force:package:beta:version:create'];
  public static readonly summary = messages.getMessage('cliDescription');
  public static readonly description = messages.getMessage('cliLongDescription');
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
    }),
    path: flags.directory({
      char: 'd',
      description: messages.getMessage('path'),
      longDescription: messages.getMessage('longPath'),
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
    language: flags.string({
      description: messages.getMessage('language'),
      longDescription: messages.getMessage('languageLong'),
    }),
  };

  public async run(): Promise<Partial<PackageVersionCreateRequestResult>> {
    if (this.flags.path && this.flags.package) {
      this.ux.warn(
        'Starting in v59.0 or later, specifying both the --package and --path flag will no longer be supported. Only one is required.'
      );
      void Lifecycle.getInstance().emitTelemetry({ Name: 'PathAndPackageFlag' });
    }

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

    this.ux.startSpinner(messages.getMessage('requestInProgress'));
    const result = await PackageVersion.create(
      {
        connection: this.hubOrg.getConnection(),
        project: this.project,
        ...this.flags,
        packageId: this.flags.package as string,
        path: this.flags.path as string,
      },
      {
        timeout: this.flags.wait as Duration,
        frequency,
      }
    );
    this.ux.stopSpinner(messages.getMessage('packageVersionCreateFinalStatus', [result.Status]));
    switch (result.Status) {
      case 'Error':
        throw messages.createError('multipleErrors', [
          result.Error.map((e: string, i) => `${os.EOL}(${i + 1}) ${e}`).join(''),
        ]);
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
