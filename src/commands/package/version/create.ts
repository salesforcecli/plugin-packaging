/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import os from 'node:os';
import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { camelCaseToTitleCase, Duration, env } from '@salesforce/kit';
import { Lifecycle, Messages } from '@salesforce/core';
import {
  INSTALL_URL_BASE,
  PackageVersion,
  PackageVersionCreateReportProgress,
  PackageVersionCreateRequestResult,
  PackageVersionEvents,
  PackagingSObjects,
} from '@salesforce/packaging';
import { requiredHubFlag } from '../../../utils/hubFlag.js';
import Package2VersionStatus = PackagingSObjects.Package2VersionStatus;

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create');

export type PackageVersionCommandResult = Partial<PackageVersionCreateRequestResult>;

export class PackageVersionCreateCommand extends SfCommand<PackageVersionCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:version:create'];
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    branch: Flags.string({
      char: 'b',
      summary: messages.getMessage('flags.branch.summary'),
    }),
    'build-instance': Flags.string({
      deprecateAliases: true,
      aliases: ['buildinstance'],
      char: 's',
      summary: messages.getMessage('flags.build-instance.summary'),
      hidden: true,
    }),
    'code-coverage': Flags.boolean({
      deprecateAliases: true,
      aliases: ['codecoverage'],
      char: 'c',
      summary: messages.getMessage('flags.code-coverage.summary'),
      description: messages.getMessage('flags.code-coverage.description'),
      default: false,
      exclusive: ['skip-validation'],
    }),
    'definition-file': Flags.file({
      deprecateAliases: true,
      exists: true,
      aliases: ['definitionfile'],
      char: 'f',
      summary: messages.getMessage('flags.definition-file.summary'),
      description: messages.getMessage('flags.definition-file.description'),
    }),
    'installation-key': Flags.string({
      deprecateAliases: true,
      aliases: ['installationkey'],
      char: 'k',
      summary: messages.getMessage('flags.installation-key.summary'),
      exactlyOne: ['installation-key', 'installation-key-bypass'],
    }),
    'installation-key-bypass': Flags.boolean({
      char: 'x',
      deprecateAliases: true,
      aliases: ['installationkeybypass'],
      summary: messages.getMessage('flags.installation-key-bypass.summary'),
      description: messages.getMessage('flags.installation-key-bypass.description'),
      exactlyOne: ['installation-key', 'installation-key-bypass'],
    }),
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.package.summary'),
    }),
    path: Flags.directory({
      char: 'd',
      summary: messages.getMessage('flags.path.summary'),
    }),
    'post-install-script': Flags.string({
      deprecateAliases: true,
      aliases: ['postinstallscript'],
      summary: messages.getMessage('flags.post-install-script.summary'),
      description: messages.getMessage('flags.post-install-script.description'),
    }),
    'post-install-url': Flags.string({
      deprecateAliases: true,
      aliases: ['postinstallurl'],
      summary: messages.getMessage('flags.post-install-url.summary'),
      description: messages.getMessage('flags.post-install-url.description'),
    }),
    preserve: Flags.boolean({
      char: 'r',
      summary: messages.getMessage('flags.preserve.summary'),
      hidden: true,
    }),
    'releasenotes-url': Flags.string({
      deprecateAliases: true,
      aliases: ['releasenotesurl'],
      summary: messages.getMessage('flags.releasenotes-url.summary'),
      description: messages.getMessage('flags.releasenotes-url.description'),
    }),
    'skip-ancestor-check': Flags.boolean({
      deprecateAliases: true,
      aliases: ['skipancestorcheck'],
      summary: messages.getMessage('flags.skip-ancestor-check.summary'),
      default: false,
    }),
    'skip-validation': Flags.boolean({
      deprecateAliases: true,
      aliases: ['skipvalidation'],
      summary: messages.getMessage('flags.skip-validation.summary'),
      description: messages.getMessage('flags.skip-validation.description'),
      default: false,
      exclusive: ['code-coverage', 'async-validation'],
    }),
    'async-validation': Flags.boolean({
      summary: messages.getMessage('flags.async-validation.summary'),
      description: messages.getMessage('flags.async-validation.description'),
      default: false,
      exclusive: ['skip-validation'],
    }),
    tag: Flags.string({
      char: 't',
      summary: messages.getMessage('flags.tag.summary'),
    }),
    'uninstall-script': Flags.string({
      deprecateAliases: true,
      aliases: ['uninstallscript'],
      summary: messages.getMessage('flags.uninstall-script.summary'),
      description: messages.getMessage('flags.uninstall-script.description'),
    }),
    'validate-schema': Flags.boolean({
      deprecateAliases: true,
      aliases: ['validateschema'],
      char: 'j',
      summary: messages.getMessage('flags.validate-schema.summary'),
      hidden: true,
    }),
    'version-description': Flags.string({
      deprecateAliases: true,
      aliases: ['versiondescription'],
      char: 'e',
      summary: messages.getMessage('flags.version-description.summary'),
    }),
    'version-name': Flags.string({
      deprecateAliases: true,
      aliases: ['versionname'],
      char: 'a',
      summary: messages.getMessage('flags.version-name.summary'),
    }),
    'version-number': Flags.string({
      deprecateAliases: true,
      aliases: ['versionnumber'],
      char: 'n',
      summary: messages.getMessage('flags.version-number.summary'),
      description: messages.getMessage('flags.version-number.description'),
    }),
    wait: Flags.duration({
      unit: 'minutes',
      char: 'w',
      summary: messages.getMessage('flags.wait.summary'),
      default: Duration.minutes(0),
    }),
    language: Flags.string({
      summary: messages.getMessage('flags.language.summary'),
      description: messages.getMessage('flags.language.description'),
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
      description: messages.getMessage('flags.verbose.description'),
    }),
  };

  public async run(): Promise<PackageVersionCommandResult> {
    const { flags } = await this.parse(PackageVersionCreateCommand);
    if (flags.path && flags.package) {
      this.warn(
        'Starting in v59.0 or later, specifying both the --package and --path flag will no longer be supported. Only one is required.'
      );
      void Lifecycle.getInstance().emitTelemetry({ Name: 'PathAndPackageFlag' });
    }

    if (flags['skip-validation']) {
      this.warn(messages.getMessage('skip-validation-warning'));
    }
    const frequency = flags.wait && flags['skip-validation'] ? Duration.seconds(5) : Duration.seconds(30);
    Lifecycle.getInstance().on(
      PackageVersionEvents.create.progress,
      // no async methods
      // eslint-disable-next-line @typescript-eslint/require-await
      async (data: PackageVersionCreateReportProgress) => {
        if (
          data.Status !== Package2VersionStatus.success &&
          data.Status !== Package2VersionStatus.error &&
          data.Status !== Package2VersionStatus.performingValidations
        ) {
          const status = messages.getMessage('packageVersionCreateWaitingStatus', [
            data.remainingWaitTime.minutes,
            data.Status,
          ]);
          if (flags.verbose) {
            this.log(status);
          } else {
            this.spinner.status = status;
          }
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

    const startMsg = messages.getMessage('requestInProgress');
    // verbose does not use a spinner to ensure a separate line for each status update.
    if (flags.verbose) {
      this.log(`${startMsg}..`);
    } else {
      this.spinner.start(startMsg);
    }

    // Set the SF_APPLY_REPLACEMENTS_ON_CONVERT env var so that
    // string replacements happen automatically.
    env.setBoolean('SF_APPLY_REPLACEMENTS_ON_CONVERT', true);

    const result = await PackageVersion.create(
      {
        connection: flags['target-dev-hub'].getConnection(flags['api-version']),
        project: this.project!,
        ...Object.fromEntries(Object.entries(flags).map(([key, value]) => [key.replace(/-/g, ''), value])),
        packageId: flags.package,
        path: flags.path,
      },
      {
        timeout: flags.wait,
        frequency,
      }
    );
    const finalStatusMsg = messages.getMessage('packageVersionCreateFinalStatus', [result.Status]);
    if (flags.verbose) {
      this.log(finalStatusMsg);
    } else {
      this.spinner.stop(finalStatusMsg);
    }

    switch (result.Status) {
      case Package2VersionStatus.error:
        throw messages.createError('multipleErrors', [
          result.Error?.map((e: string, i) => `${os.EOL}(${i + 1}) ${e}`).join(''),
        ]);
      case Package2VersionStatus.performingValidations:
        this.log(messages.getMessage('packageVersionCreatePerformingValidations'));
        this.log(
          messages.getMessage(Package2VersionStatus.success, [
            result.Id,
            result.SubscriberPackageVersionId,
            INSTALL_URL_BASE.toString(),
            result.SubscriberPackageVersionId,
            this.config.bin,
          ])
        );
        break;
      case Package2VersionStatus.success:
        this.log(
          messages.getMessage(result.Status, [
            result.Id,
            result.SubscriberPackageVersionId,
            INSTALL_URL_BASE.toString(),
            result.SubscriberPackageVersionId,
            this.config.bin,
          ])
        );
        break;
      default:
        this.log(
          messages.getMessage('InProgress', [camelCaseToTitleCase(result.Status as string), this.config.bin, result.Id])
        );
    }
    return result;
  }
}
