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
    const scheduledLastDays = flags['scheduled-last-days'];

    // Check if scheduledLastDays is valid
    if (flags['scheduled-last-days'] !== undefined) {
      if (isNaN(scheduledLastDays!) || scheduledLastDays! <= 0) {
        throw new Error('Invalid value for --scheduled-last-days. It must be a positive integer.');
      }
    }

    // Get results of query here
    // Use const since we will add verbose later
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const results: PackagePushRequestListResult[] = await PackagePushUpgrade.list(this.connection, {
      packageId: flags.packageid,
      status: flags.status,
      scheduledLastDays,
    });

    if (results.length === 0) {
      this.warn('No results found');
    } else {
      const data = await Promise.all(
        results.map(async (record: PackagePushRequestListResult) => {
          const packagePushRequestOptions = { packagePushRequestId: record.PushRequestId! };
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          const totalNumOrgs = await PackagePushUpgrade.getTotalJobs(this.connection, packagePushRequestOptions);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          const numOrgsUpgradedFail = await PackagePushUpgrade.getFailedJobs(
            this.connection,
            packagePushRequestOptions
          );
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          const numOrgsUpgradedSuccess = await PackagePushUpgrade.getSucceededJobs(
            this.connection,
            packagePushRequestOptions
          );

          return {
            PushRequestId: record?.PushRequestId,
            PackageVersionId: record?.PackageVersionId,
            PushRequestStatus: record?.PushRequestStatus,
            PushRequestScheduledDateTime: record?.PushRequestScheduledDateTime,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            NumOrgsScheduled: totalNumOrgs,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            NumOrgsUpgradedFail: numOrgsUpgradedFail,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            NumOrgsUpgradedSuccess: numOrgsUpgradedSuccess,
          };
        })
      );

      this.table({ data, overflow: 'wrap', title: chalk.blue(`Push Upgrade Request List:  [${results.length}]`) });
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return results;
  }
}
