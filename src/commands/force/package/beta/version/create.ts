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
  requiredHubFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
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

export class PackageVersionCreateCommand extends SfCommand<Partial<PackageVersionCreateRequestResult>> {
  public static readonly summary = messages.getMessage('cliDescription');
  public static readonly description = messages.getMessage('cliLongDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);

  public static readonly requiresProject = true;
  public static readonly flags = {
    'target-hub-org': requiredHubFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    branch: Flags.string({
      char: 'b',
      summary: messages.getMessage('branch'),
      description: messages.getMessage('longBranch'),
    }),
    buildinstance: Flags.string({
      char: 's',
      summary: messages.getMessage('instance'),
      description: messages.getMessage('longInstance'),
      hidden: true,
    }),
    codecoverage: Flags.boolean({
      char: 'c',
      summary: messages.getMessage('codeCoverage'),
      description: messages.getMessage('longCodeCoverage'),
      default: false,
      exclusive: ['skipvalidation'],
    }),
    definitionfile: Flags.file({
      char: 'f',
      summary: messages.getMessage('definitionfile'),
      description: messages.getMessage('longDefinitionfile'),
    }),
    installationkey: Flags.string({
      char: 'k',
      summary: messages.getMessage('key'),
      description: messages.getMessage('longKey'),
      exactlyOne: ['installationkey', 'installationkeybypass'],
    }),
    installationkeybypass: Flags.boolean({
      char: 'x',
      summary: messages.getMessage('keyBypass'),
      description: messages.getMessage('longKeyBypass'),
      exactlyOne: ['installationkey', 'installationkeybypass'],
    }),
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('package'),
      description: messages.getMessage('longPackage', []),
      exactlyOne: ['path', 'package'],
    }),
    path: Flags.directory({
      char: 'd',
      summary: messages.getMessage('path'),
      description: messages.getMessage('longPath'),
      exactlyOne: ['path', 'package'],
    }),
    postinstallscript: Flags.string({
      summary: messages.getMessage('postInstallScript'),
      description: messages.getMessage('postInstallScriptLong'),
    }),
    postinstallurl: Flags.url({
      summary: messages.getMessage('postInstallUrl'),
      description: messages.getMessage('postInstallUrlLong'),
    }),
    preserve: Flags.boolean({
      char: 'r',
      summary: messages.getMessage('preserve'),
      description: messages.getMessage('longPreserve'),
      hidden: true,
    }),
    releasenotesurl: Flags.url({
      summary: messages.getMessage('releaseNotesUrl'),
      description: messages.getMessage('releaseNotesUrlLong'),
    }),
    skipancestorcheck: Flags.boolean({
      summary: messages.getMessage('skipAncestorCheck'),
      description: messages.getMessage('skipAncestorCheckLong'),
      default: false,
    }),
    skipvalidation: Flags.boolean({
      summary: messages.getMessage('skipValidation'),
      description: messages.getMessage('skipValidationLong'),
      default: false,
      exclusive: ['codecoverage'],
    }),
    tag: Flags.string({
      char: 't',
      summary: messages.getMessage('tag'),
      description: messages.getMessage('longTag'),
    }),
    uninstallscript: Flags.string({
      summary: messages.getMessage('uninstallScript'),
      description: messages.getMessage('uninstallScriptLong'),
    }),
    validateschema: Flags.boolean({
      char: 'j',
      summary: messages.getMessage('validateschema'),
      description: messages.getMessage('longValidateschema'),
      hidden: true,
    }),
    versiondescription: Flags.string({
      char: 'e',
      summary: messages.getMessage('versiondescription'),
      description: messages.getMessage('longVersiondescription'),
    }),
    versionname: Flags.string({
      char: 'a',
      summary: messages.getMessage('versionname'),
      description: messages.getMessage('longVersionname'),
    }),
    versionnumber: Flags.string({
      char: 'n',
      summary: messages.getMessage('versionnumber'),
      description: messages.getMessage('longVersionnumber'),
    }),
    wait: Flags.duration({
      unit: 'minutes',
      char: 'w',
      summary: messages.getMessage('wait'),
      description: messages.getMessage('longWait'),
      defaultValue: 0,
    }),
    language: Flags.string({
      summary: messages.getMessage('language'),
      description: messages.getMessage('languageLong'),
    }),
  };

  public async run(): Promise<Partial<PackageVersionCreateRequestResult>> {
    const { flags } = await this.parse(PackageVersionCreateCommand);
    if (flags.skipvalidation) {
      this.warn(messages.getMessage('skipValidationWarning'));
    }
    const frequency = flags.wait && flags.skipvalidation ? Duration.seconds(5) : Duration.seconds(30);
    Lifecycle.getInstance().on(
      PackageVersionEvents.create.progress,
      // no async methods
      // eslint-disable-next-line @typescript-eslint/require-await
      async (data: PackageVersionCreateReportProgress) => {
        if (data.Status !== Package2VersionStatus.success && data.Status !== Package2VersionStatus.error) {
          this.spinner.status = messages.getMessage('packageVersionCreateWaitingStatus', [
            data.remainingWaitTime.minutes,
            data.Status,
          ]);
        }
      }
    );
    Lifecycle.getInstance().on(
      PackageVersionEvents.create['preserve-files'],
      // eslint-disable-next-line @typescript-eslint/require-await
      async (data: { location: string; message: string }) => {
        this.log(messages.getMessage('tempFileLocation', [data.location]));
      }
    );

    this.spinner.start(messages.getMessage('requestInProgress'));

    const result = await PackageVersion.create(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        connection: flags['target-hub-org'].getConnection(flags['api-version']),
        project: this.project,
        packageId: flags.package,
        ...flags,
      },
      {
        timeout: flags.wait,
        frequency,
      }
    );
    this.spinner.stop(messages.getMessage('packageVersionCreateFinalStatus', [result.Status]));
    switch (result.Status) {
      case 'Error':
        throw messages.createError('multipleErrors', [
          result.Error?.map((e: string, i) => `${os.EOL}(${i + 1}) ${e}`).join(''),
        ]);
      case 'Success':
        this.log(
          messages.getMessage(result.Status, [
            result.Id,
            result.SubscriberPackageVersionId,
            INSTALL_URL_BASE.toString(),
            result.SubscriberPackageVersionId,
          ])
        );
        break;
      default:
        this.log(messages.getMessage('InProgress', [camelCaseToTitleCase(result.Status as string), result.Id]));
    }
    return result;
  }
}
