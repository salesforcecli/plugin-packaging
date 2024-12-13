/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Connection, Messages } from '@salesforce/core';
import { PackagePushRequestListResult, PackagePushUpgrade } from '@salesforce/packaging';
import chalk from 'chalk';
import { requiredHubFlag } from '../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_pushupgrade_list');

type Status = 'Created' | 'Cancelled' | 'Pending' | 'In Progress' | 'Failed' | 'Succeeded';

export type PackagePushRequestListResultArr = PackagePushRequestListResult[];

export class PackagePushRequestListCommand extends SfCommand<PackagePushRequestListResultArr> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly aliases = ['force:package:pushupgrade:list'];
  public static readonly flags = {
    'target-dev-hub': requiredHubFlag,
    packageid: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.package-id.summary'),
      required: true,
    }),
    'scheduled-last-days': Flags.integer({
      char: 'l',
      deprecateAliases: true,
      aliases: ['scheduledlastdays'],
      summary: messages.getMessage('flags.scheduled-last-days.summary'),
    }),
    status: Flags.custom<Status>({
      options: ['Created', 'Cancelled', 'Pending', 'In Progress', 'Failed', 'Succeeded'],
    })({
      char: 's',
      summary: messages.getMessage('flags.status.summary'),
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  private connection!: Connection;

  public async run(): Promise<PackagePushRequestListResultArr> {
    const { flags } = await this.parse(PackagePushRequestListCommand);
    this.connection = flags['target-dev-hub'].getConnection('61.0');

    // Get results of query here
    // Use const since we will add verbose later
    const results = await PackagePushUpgrade.list(this.connection, {
      packageId: flags.packageid,
      status: flags.status,
    });

    if (results.length === 0) {
      this.warn('No results found');
    } else {
      // if (flags.verbose) {
      //   try {
      //     results = fetchVerboseData(results);
      //   } catch (err) {
      //     const errMsg = typeof err === 'string' ? err : err instanceof Error ? err.message : 'unknown error';
      //     this.warn(`error when retrieving verbose data due to: ${errMsg}`);
      //   }
      // }

      const data = results.map((record) => ({
        PushRequestId: record?.PushRequestId,
        PackageVersionId: record?.PackageVersionId,
        PushRequestStatus: record?.PushRequestStatus,
        PushRequestScheduledDateTime: 'test',
        NumOrgsScheduled: 0,
        NumOrgsUpgradedFail: 0,
        NumOrgsUpgradedSuccess: 0,
      }));

      this.table({ data, overflow: 'wrap', title: chalk.blue(`Push Upgrade Request List:  [${results.length}]`) });
    }
    return results;
  }
}

// function fetchVerboseData(results: PackagePushRequestListResultArr): PackagePushRequestListResultArr {
//   return results.map((result) => ({
//     ...result,
//     ...{
//       PushUpgradeRequestCreatedDateTime: '',
//       ActualUpgradeStartTime: '',
//       ActualUpgradeEndTime: '',
//       ActualDurationsOfPushUpgrades: 0,
//     },
//   }));
// }
