/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Lifecycle, Messages, SfError, SfProject } from '@salesforce/core';
import {
  INSTALL_URL_BASE,
  Package,
  PackageEvents,
  PackageVersionCreateEventData,
  PackageVersionCreateRequestResult,
  PackagingSObjects,
} from '@salesforce/packaging';
import { camelCaseToTitleCase, Duration } from '@salesforce/kit';
import { requiredHubFlag } from '../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_convert');
const pvcMessages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create');

export class PackageConvert extends SfCommand<PackageVersionCreateRequestResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:convert'];
  public static readonly hidden = true;
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    package: Flags.salesforceId({
      length: 'both',
      char: 'p',
      summary: messages.getMessage('flags.package.summary'),
      required: true,
      startsWith: '033',
    }),
    'installation-key': Flags.string({
      char: 'k',
      deprecateAliases: true,
      aliases: ['installationkey'],
      summary: messages.getMessage('flags.installation-key.summary'),
      description: messages.getMessage('flags.installation-key.description'),
      exactlyOne: ['installation-key', 'installation-key-bypass'],
    }),
    'definition-file': Flags.file({
      char: 'f',
      deprecateAliases: true,
      aliases: ['definitionfile'],
      summary: messages.getMessage('flags.definition-file.summary'),
      description: messages.getMessage('flags.definition-file.description'),
    }),
    'installation-key-bypass': Flags.boolean({
      char: 'x',
      deprecateAliases: true,
      aliases: ['installationkeybypass'],
      summary: messages.getMessage('flags.installation-key-bypass.summary'),
      description: messages.getMessage('flags.installation-key-bypass.description'),
      exactlyOne: ['installation-key', 'installation-key-bypass'],
    }),
    wait: Flags.duration({
      unit: 'minutes',
      char: 'w',
      summary: messages.getMessage('flags.wait.summary'),
      default: Duration.minutes(0),
    }),
    'build-instance': Flags.string({
      char: 's',
      deprecateAliases: true,
      aliases: ['buildinstance'],
      summary: messages.getMessage('flags.build-instance.summary'),
      hidden: true,
    }),
    'seed-metadata': Flags.directory({
      char: 'm',
      summary: messages.getMessage('flags.seed-metadata.summary'),
      description: messages.getMessage('flags.seed-metadata.description'),
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  public async run(): Promise<PackageVersionCreateRequestResult> {
    const { flags } = await this.parse(PackageConvert);
    // eslint-disable-next-line @typescript-eslint/require-await
    Lifecycle.getInstance().on(PackageEvents.convert.progress, async (data: PackageVersionCreateEventData) => {
      const inProgressMessage = messages.getMessage('in-progress', [
        data.timeRemaining?.seconds,
        camelCaseToTitleCase(data.packageVersionCreateRequestResult.Status),
      ]);
      this.display(inProgressMessage, flags.verbose);
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    Lifecycle.getInstance().on(PackageEvents.convert.success, async () => {
      this.display('SUCCESS', flags.verbose);
    });

    if (flags.verbose) {
      this.log('Converting Package');
    } else {
      this.spinner.start('Converting Package', 'Initializing');
    }
    // initialize the project instance if in a project
    let project: SfProject | undefined;
    try {
      project = await SfProject.resolve();
    } catch (err) {
      // ignore project is optional
    }
    const result = await Package.convert(
      flags.package,
      flags['target-dev-hub'].getConnection(flags['api-version']),
      {
        wait: flags.wait,
        installationKey: flags['installation-key'] as string,
        definitionfile: flags['definition-file'] as string,
        installationKeyBypass: flags['installation-key-bypass'],
        buildInstance: flags['build-instance'] as string,
        seedMetadata: flags['seed-metadata'] as string,
      },
      project
    );

    switch (result.Status) {
      case PackagingSObjects['Package2VersionStatus'].error:
        this.spinner.stop();
        throw new SfError(result.Error?.join('\n') ?? pvcMessages.getMessage('unknownError'));
      case PackagingSObjects['Package2VersionStatus'].success: {
        const successMessage = pvcMessages.getMessage(result.Status, [
          result.Id,
          result.SubscriberPackageVersionId,
          INSTALL_URL_BASE.toString(),
          result.SubscriberPackageVersionId,
          this.config.bin,
        ]);
        if (flags.verbose) {
          this.log(successMessage);
        } else {
          this.spinner.stop(successMessage);
        }
        break;
      }
      default: {
        const inProgressMessage = pvcMessages.getMessage('InProgress', [
          this.config.bin,
          camelCaseToTitleCase(result.Status),
          result.Id,
        ]);
        this.display(inProgressMessage, flags.verbose);
      }
    }

    this.spinner.stop();
    return result;
  }

  private display(message: string, verbose: boolean): void {
    if (verbose) {
      this.log(message);
    } else {
      this.spinner.status = message;
    }
  }
}
