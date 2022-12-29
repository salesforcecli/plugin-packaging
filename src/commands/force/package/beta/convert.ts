/*
 * Copyright (c) 2018, salesforce.com, inc.
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
import { Lifecycle, Messages, SfError, SfProject } from '@salesforce/core';
import {
  INSTALL_URL_BASE,
  Package,
  PackageEvents,
  PackageVersionCreateEventData,
  PackageVersionCreateRequestResult,
} from '@salesforce/packaging';
import { camelCaseToTitleCase, Duration } from '@salesforce/kit';
import { Optional } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_convert');
const pvcMessages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create');

export class PackageConvert extends SfCommand<PackageVersionCreateRequestResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('summary');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);

  public static readonly hidden = true;
  public static readonly flags = {
    loglevel,
    'target-hub-org': requiredHubFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    package: Flags.salesforceId({
      char: 'p',
      summary: messages.getMessage('package'),
      description: messages.getMessage('package-long'),
      required: true,
      startsWith: '033',
    }),
    'installation-key': Flags.string({
      char: 'k',
      aliases: ['installationkey'],
      summary: messages.getMessage('key'),
      description: messages.getMessage('key-long'),
      exactlyOne: ['installation-key', 'installation-key-bypass'],
    }),
    'definition-file': Flags.file({
      char: 'f',
      aliases: ['definitionfile'],
      summary: messages.getMessage('definition-file'),
      description: messages.getMessage('definition-file-long'),
      hidden: true,
    }),
    'installation-key-bypass': Flags.boolean({
      char: 'x',
      aliases: ['installationkeybypass'],
      summary: messages.getMessage('key-bypass'),
      description: messages.getMessage('key-bypass-long'),
      exactlyOne: ['installation-key', 'installation-key-bypass'],
    }),
    wait: Flags.duration({
      unit: 'minutes',
      char: 'w',
      summary: messages.getMessage('wait'),
      description: messages.getMessage('wait-long'),
      default: Duration.minutes(0),
    }),
    'build-instance': Flags.string({
      char: 's',
      aliases: ['buildinstance'],
      summary: messages.getMessage('instance'),
      description: messages.getMessage('instance-long'),
      hidden: true,
    }),
  };

  public async run(): Promise<PackageVersionCreateRequestResult> {
    const { flags } = await this.parse(PackageConvert);
    // eslint-disable-next-line @typescript-eslint/require-await
    Lifecycle.getInstance().on(PackageEvents.convert.progress, async (data: PackageVersionCreateEventData) => {
      this.spinner.status = messages.getMessage('in-progress', [
        data.timeRemaining?.seconds,
        camelCaseToTitleCase(data.packageVersionCreateRequestResult.Status),
      ]);
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    Lifecycle.getInstance().on(PackageEvents.convert.success, async () => {
      this.spinner.status = 'SUCCESS';
    });

    this.spinner.start('Converting Package', 'Initializing');
    // initialize the project instance if in a project
    let project: Optional<SfProject>;
    try {
      project = await SfProject.resolve();
    } catch (err) {
      // ignore project is optional
    }
    this.spinner.status = 'Converting Package';
    const result = await Package.convert(
      flags.package,
      flags['target-hub-org'].getConnection(flags['api-version']),
      {
        wait: flags.wait,
        installationKey: flags['installation-key'] as string,
        definitionfile: flags['definition-file'] as string,
        installationKeyBypass: flags['installation-key-bypass'],
        buildInstance: flags['build-instance'] as string,
      },
      project
    );

    switch (result.Status) {
      case 'Error':
        this.spinner.stop();
        throw new SfError(result.Error?.join('\n') ?? pvcMessages.getMessage('unknownError'));
      case 'Success':
        this.spinner.stop(
          pvcMessages.getMessage(result.Status, [
            result.Id,
            result.SubscriberPackageVersionId,
            INSTALL_URL_BASE.toString(),
            result.SubscriberPackageVersionId,
          ])
        );
        break;
      default:
        this.spinner.status = pvcMessages.getMessage('InProgress', [camelCaseToTitleCase(result.Status), result.Id]);
    }

    this.spinner.stop();
    return result;
  }
}
