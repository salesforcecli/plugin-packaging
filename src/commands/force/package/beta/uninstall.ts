/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Lifecycle, Messages } from '@salesforce/core';
import { PackageEvents, PackagingSObjects, SubscriberPackageVersion } from '@salesforce/packaging';
import { Duration } from '@salesforce/kit';
import { resolveSubscriberPackageVersionId } from '../../../../util';

type UninstallResult = PackagingSObjects.SubscriberPackageVersionUninstallRequest;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_uninstall');

export class PackageUninstallCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresUsername = true;
  public static readonly flagsConfig: FlagsConfig = {
    wait: flags.minutes({
      char: 'w',
      description: messages.getMessage('wait'),
      longDescription: messages.getMessage('waitLong'),
      default: Duration.minutes(0),
    }),
    package: flags.string({
      char: 'p',
      description: messages.getMessage('package'),
      longDescription: messages.getMessage('packageLong'),
      required: true,
    }),
  };

  public async run(): Promise<UninstallResult> {
    // no awaits in async method
    // eslint-disable-next-line @typescript-eslint/require-await
    Lifecycle.getInstance().on(PackageEvents.uninstall, async (data: UninstallResult) => {
      // Request still in progress.  Just print a console message and move on. Server will be polled again.
      this.ux.log(`Waiting for the package uninstall request to get processed. Status = ${data.Status}`);
    });

    const packageId = resolveSubscriberPackageVersionId(this.flags.package);

    const packageVersion = new SubscriberPackageVersion({
      id: packageId,
      connection: this.org.getConnection(),
      password: undefined,
    });

    const result = await packageVersion.uninstall(this.flags.wait);

    const arg = result.Status === 'Success' ? [result.SubscriberPackageVersionId] : [result.Id, this.org.getUsername()];
    this.ux.log(messages.getMessage(result.Status, arg));

    return result;
  }
}
