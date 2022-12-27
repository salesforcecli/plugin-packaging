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
  requiredOrgFlagWithDeprecations,
  SfCommand,
  Ux,
} from '@salesforce/sf-plugins-core';
import { Messages, Org } from '@salesforce/core';
import { PackagingSObjects, SubscriberPackageVersion } from '@salesforce/packaging';
import { Install as InstallCommand } from '../install';

type PackageInstallRequest = PackagingSObjects.PackageInstallRequest;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install_report');
const installMsgs = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install');

export class Report extends SfCommand<PackageInstallRequest> {
  public static readonly summary = messages.getMessage('cliDescription');
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static org: Org;

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    requestid: Flags.salesforceId({
      char: 'i',
      summary: messages.getMessage('requestId'),
      description: messages.getMessage('requestIdLong'),
      required: true,
    }),
  };

  public async run(): Promise<PackageInstallRequest> {
    const { flags } = await this.parse(Report);
    const connection = flags['target-org'].getConnection(flags['api-version']);
    const pkgInstallRequest = await SubscriberPackageVersion.getInstallRequest(flags.requestid, connection);
    InstallCommand.parseStatus(
      pkgInstallRequest,
      new Ux({ jsonEnabled: this.jsonEnabled() }),
      installMsgs,
      flags['target-org'].getUsername() as string
    );

    return pkgInstallRequest;
  }
}
