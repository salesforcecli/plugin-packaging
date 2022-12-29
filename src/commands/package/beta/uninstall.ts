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
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Lifecycle, Messages } from '@salesforce/core';
import { PackageEvents, PackagingSObjects, SubscriberPackageVersion } from '@salesforce/packaging';
import { Duration } from '@salesforce/kit';

export type UninstallResult = PackagingSObjects.SubscriberPackageVersionUninstallRequest;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_uninstall');

export class PackageUninstallCommand extends SfCommand<UninstallResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('summary');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly aliases = ['force:package:beta:uninstall'];
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    wait: Flags.duration({
      unit: 'minutes',
      char: 'w',
      summary: messages.getMessage('wait'),
      description: messages.getMessage('wait-long'),
      default: Duration.minutes(0),
    }),
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('package'),
      description: messages.getMessage('package-long'),
      required: true,
    }),
  };

  public async run(): Promise<UninstallResult> {
    const { flags } = await this.parse(PackageUninstallCommand);
    // no awaits in async method
    // eslint-disable-next-line @typescript-eslint/require-await
    Lifecycle.getInstance().on(PackageEvents.uninstall, async (data: UninstallResult) => {
      // Request still in progress.  Just print a console message and move on. Server will be polled again.
      this.log(`Waiting for the package uninstall request to get processed. Status = ${data.Status}`);
    });

    const packageVersion = new SubscriberPackageVersion({
      aliasOrId: flags.package,
      connection: flags['target-org'].getConnection(flags['api-version']),
      password: undefined,
    });

    const result = await packageVersion.uninstall(Duration.seconds(30), flags.wait);

    const arg =
      result.Status === 'Success'
        ? [result.SubscriberPackageVersionId]
        : [result.Id, flags['target-org'].getUsername()];
    this.log(messages.getMessage(result.Status, arg));

    return result;
  }
}
