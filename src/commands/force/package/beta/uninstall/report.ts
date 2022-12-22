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
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { PackagingSObjects, SubscriberPackageVersion } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_uninstall_report');

export class PackageUninstallReportCommand extends SfCommand<PackagingSObjects.SubscriberPackageVersionUninstallRequest> {
  public static readonly summary = messages.getMessage('cliDescription');
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    requestid: Flags.salesforceId({
      char: 'i',
      summary: messages.getMessage('requestId'),
      description: messages.getMessage('requestIdLong'),
      required: true,
      startsWith: '06y',
    }),
  };

  public async run(): Promise<PackagingSObjects.SubscriberPackageVersionUninstallRequest> {
    const { flags } = await this.parse(PackageUninstallReportCommand);
    const requestId = flags.requestid;
    const result = await SubscriberPackageVersion.uninstallStatus(
      requestId,
      flags['target-org'].getConnection(flags['api-version'])
    );

    const arg =
      result.Status === 'Success'
        ? [result.SubscriberPackageVersionId]
        : [result.Id, flags['target-org'].getUsername()];
    this.log(messages.getMessage(result.Status, arg));

    return result;
  }
}
