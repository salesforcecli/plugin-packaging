/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { PackagingSObjects, SubscriberPackageVersion } from '@salesforce/packaging';
import { Install as InstallCommand } from '../install';

type PackageInstallRequest = PackagingSObjects.PackageInstallRequest;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install_report');
const installMsgs = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install');

export class Report extends SfdxCommand {
  public static aliases = ['force:package:beta:install:report'];
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresUsername = true;
  public static readonly flagsConfig: FlagsConfig = {
    requestid: flags.id({
      char: 'i',
      description: messages.getMessage('requestId'),
      longDescription: messages.getMessage('requestIdLong'),
      required: true,
    }),
  };

  public async run(): Promise<PackageInstallRequest> {
    const connection = this.org.getConnection();
    const pkgInstallRequest = await SubscriberPackageVersion.getInstallRequest(
      this.flags.requestid as string,
      connection
    );
    InstallCommand.parseStatus(pkgInstallRequest, this.ux, installMsgs, this.org.getUsername());

    return pkgInstallRequest;
  }
}
