/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Duration } from '@salesforce/kit';
import { Lifecycle, Messages, SfError, SfProject } from '@salesforce/core';
import {
  INSTALL_URL_BASE,
  Package,
  PackageEvents,
  PackageVersionCreateEventData,
  PackageVersionCreateRequestResult,
} from '@salesforce/packaging';
import { camelCaseToTitleCase } from '@salesforce/kit';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_convert');
const pvcMessages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create');

export class PackageConvert extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresDevhubUsername = true;
  public static readonly hidden = true;
  public static readonly flagsConfig: FlagsConfig = {
    package: flags.id({
      char: 'p',
      description: messages.getMessage('package'),
      longDescription: messages.getMessage('longPackage'),
      required: true,
      validate: /^033/,
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
    wait: flags.minutes({
      char: 'w',
      description: messages.getMessage('wait'),
      longDescription: messages.getMessage('longWait'),
      default: Duration.minutes(0),
    }),
    buildinstance: flags.string({
      char: 's',
      description: messages.getMessage('instance'),
      longDescription: messages.getMessage('longInstance'),
      hidden: true,
    }),
  };

  public async run(): Promise<PackageVersionCreateRequestResult> {
    // eslint-disable-next-line @typescript-eslint/require-await
    Lifecycle.getInstance().on(PackageEvents.convert.progress, async (data: PackageVersionCreateEventData) => {
      this.ux.log(
        `Request in progress. Sleeping 30 seconds. Will wait a total of ${
          data.timeRemaining.seconds
        } more seconds before timing out. Current Status='${camelCaseToTitleCase(
          data.packageVersionCreateRequestResult.Status
        )}'`
      );
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    Lifecycle.getInstance().on(PackageEvents.convert.success, async () => {
      this.ux.log('SUCCESS');
    });

    const pkg = new Package({ connection: this.hubOrg.getConnection() });
    const result = await pkg.convert(
      this.flags.package,
      {
        wait: this.flags.wait as Duration,
        installationKey: this.flags.installationkey as string,
        installationKeyBypass: this.flags.installationkeybypass as boolean,
        buildInstance: this.flags.buildinstance as string,
      },
      SfProject.getInstance()
    );

    switch (result.Status) {
      case 'Error':
        throw new SfError(result.Error?.join('\n') ?? pvcMessages.getMessage('unknownError'));
      case 'Success':
        this.ux.log(
          pvcMessages.getMessage(result.Status, [
            result.Id,
            result.SubscriberPackageVersionId,
            INSTALL_URL_BASE.toString(),
            result.SubscriberPackageVersionId,
          ])
        );
        break;
      default:
        this.ux.log(pvcMessages.getMessage('InProgress', [camelCaseToTitleCase(result.Status), result.Id]));
    }

    return result;
  }
}
