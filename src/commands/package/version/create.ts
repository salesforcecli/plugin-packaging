/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import {
  Flags,
  loglevel,
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

export type PackageVersionCommandResult = Partial<PackageVersionCreateRequestResult>;

export class PackageVersionCreateCommand extends SfCommand<PackageVersionCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('cliLongDescription');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static readonly aliases = ['force:package:beta:version:create', 'force:package:version:create'];
  public static readonly flags = {
    loglevel,
    'target-hub-org': requiredHubFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    branch: Flags.string({
      char: 'b',
      summary: messages.getMessage('branch'),
      description: messages.getMessage('branch-long'),
    }),
    'build-instance': Flags.string({
      aliases: ['buildinstance'],
      char: 's',
      summary: messages.getMessage('instance'),
      description: messages.getMessage('instance-long'),
      hidden: true,
    }),
    'code-coverage': Flags.boolean({
      aliases: ['codecoverage'],
      char: 'c',
      summary: messages.getMessage('code-coverage'),
      description: messages.getMessage('code-coverage-long'),
      default: false,
      exclusive: ['skip-validation'],
    }),
    'definition-file': Flags.file({
      aliases: ['definitionfile'],
      char: 'f',
      summary: messages.getMessage('definition-file'),
      description: messages.getMessage('definition-file-long'),
    }),
    'installation-key': Flags.string({
      aliases: ['installationkey'],
      char: 'k',
      summary: messages.getMessage('installation-key'),
      description: messages.getMessage('installation-key-long'),
      exactlyOne: ['installation-key', 'installation-key-bypass'],
    }),
    'installation-key-bypass': Flags.boolean({
      char: 'x',
      aliases: ['installationkeybypass'],
      summary: messages.getMessage('installation-key-bypass'),
      description: messages.getMessage('installation-key-bypass-long'),
      exactlyOne: ['installation-key', 'installation-key-bypass'],
    }),
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('package'),
      description: messages.getMessage('package-long'),
      exactlyOne: ['path', 'package'],
    }),
    path: Flags.directory({
      char: 'd',
      summary: messages.getMessage('path'),
      description: messages.getMessage('path-long'),
      exactlyOne: ['path', 'package'],
    }),
    'post-install-script': Flags.string({
      aliases: ['postinstallscript'],
      summary: messages.getMessage('post-install-script'),
      description: messages.getMessage('post-install-script-long'),
    }),
    'post-install-url': Flags.string({
      aliases: ['postinstallurl'],
      summary: messages.getMessage('post-install-url'),
      description: messages.getMessage('post-install-url-long'),
    }),
    preserve: Flags.boolean({
      char: 'r',
      summary: messages.getMessage('preserve'),
      description: messages.getMessage('preserve-long'),
      hidden: true,
    }),
    'releasenotes-url': Flags.string({
      aliases: ['releasenotesurl'],
      summary: messages.getMessage('release-notes-url'),
      description: messages.getMessage('release-notes-url-long'),
    }),
    'skip-ancestor-check': Flags.boolean({
      aliases: ['skipancestorcheck'],
      summary: messages.getMessage('skip-ancestor-check'),
      description: messages.getMessage('skip-ancestor-check-long'),
      default: false,
    }),
    'skip-validation': Flags.boolean({
      aliases: ['skipvalidation'],
      summary: messages.getMessage('skip-validation'),
      description: messages.getMessage('skip-validation-long'),
      default: false,
      exclusive: ['code-coverage'],
    }),
    tag: Flags.string({
      char: 't',
      summary: messages.getMessage('tag'),
      description: messages.getMessage('tag-long'),
    }),
    'uninstall-script': Flags.string({
      aliases: ['uninstallscript'],
      summary: messages.getMessage('uninstall-script'),
      description: messages.getMessage('uninstall-script-long'),
    }),
    'validate-schema': Flags.boolean({
      aliases: ['validateschema'],
      char: 'j',
      summary: messages.getMessage('validate-schema'),
      description: messages.getMessage('validate-schema-long'),
      hidden: true,
    }),
    'version-description': Flags.string({
      aliases: ['versiondescription'],
      char: 'e',
      summary: messages.getMessage('version-description'),
      description: messages.getMessage('version-description-long'),
    }),
    'version-name': Flags.string({
      aliases: ['versionname'],
      char: 'a',
      summary: messages.getMessage('version-name'),
      description: messages.getMessage('version-name-long'),
    }),
    'version-number': Flags.string({
      aliases: ['versionnumber'],
      char: 'n',
      summary: messages.getMessage('version-number'),
      description: messages.getMessage('version-number-long'),
    }),
    wait: Flags.duration({
      unit: 'minutes',
      char: 'w',
      summary: messages.getMessage('wait'),
      description: messages.getMessage('wait-long'),
      default: Duration.minutes(0),
    }),
    language: Flags.string({
      summary: messages.getMessage('language'),
      description: messages.getMessage('language-long'),
    }),
  };

  public async run(): Promise<PackageVersionCommandResult> {
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
      {
        connection: flags['target-hub-org'].getConnection(flags['api-version']),
        project: this.project,
        ...Object.fromEntries(Object.entries(flags).map(([key, value]) => [key.replace(/-/g, ''), value])),
        packageId: flags.package,
        path: flags.path,
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
