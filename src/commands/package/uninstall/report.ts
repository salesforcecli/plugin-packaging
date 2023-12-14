/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { PackagingSObjects, SubscriberPackageVersion } from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_uninstall_report');

export class PackageUninstallReportCommand extends SfCommand<PackagingSObjects.SubscriberPackageVersionUninstallRequest> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:uninstall:report'];
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    // eslint-disable-next-line sf-plugin/id-flag-suggestions
    'request-id': Flags.salesforceId({
      length: 'both',
      deprecateAliases: true,
      aliases: ['requestid'],
      char: 'i',
      summary: messages.getMessage('flags.request-id.summary'),
      required: true,
      startsWith: '06y',
    }),
  };

  public async run(): Promise<PackagingSObjects.SubscriberPackageVersionUninstallRequest> {
    const { flags } = await this.parse(PackageUninstallReportCommand);
    const result = await SubscriberPackageVersion.uninstallStatus(
      flags['request-id'],
      flags['target-org'].getConnection(flags['api-version'])
    );

    const arg =
      result.Status === 'Success'
        ? [result.SubscriberPackageVersionId]
        : [this.config.bin, result.Id, flags['target-org'].getUsername()];
    this.log(messages.getMessage(result.Status, arg));

    return result;
  }
}
