/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages, Logger } from '@salesforce/core';
import {
  PackagePushRequestListResult,
  PackagePushUpgrade,
} from '@salesforce/packaging';
import { requiredHubFlag } from '../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_pushupgrade_list');

// type PackagePushStatus = 'Created' | 'Cancelled' | 'Pending' | 'In Progress' | 'Failed' | 'Succeeded';
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
    'api-version': orgApiVersionFlagWithDeprecations,
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.package.summary'),
      required: true,
    }),
    'scheduled-last-days': Flags.integer({
      char: 'l',
      deprecateAliases: true,
      aliases: ['scheduledlastdays'],
      summary: messages.getMessage('flags.scheduled-last-days.summary'),
    }),
    status: Flags.custom<string>({
      options: ['Created', 'Cancelled', 'Pending', 'In Progress', 'Failed', 'Succeeded'],
    })({
      char: 's',
      summary: messages.getMessage('flags.status.summary'),
    }),
  };

  public async run(): Promise<PackagePushRequestListResultArr> {
    const { flags } = await this.parse(PackagePushRequestListCommand);
    const logger = await Logger.child(this.constructor.name);
    const hubOrg = flags['target-dev-hub'];
    const connection = hubOrg.getConnection(flags['api-version']);
    const scheduledLastDays = flags['scheduled-last-days'];

    if (scheduledLastDays !== undefined) {
      if (isNaN(scheduledLastDays) || scheduledLastDays <= 0) {
        throw new Error('Invalid value for --scheduled-last-days. It must be a positive integer.');
      }
    }

    logger.debug(`Querying PackagePushRequest records from org ${hubOrg.getOrgId()}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const results: PackagePushRequestListResultArr = await PackagePushUpgrade.list(connection, {
      packageId: flags.package,
      status: flags.status as 'Created' | 'Cancelled' | 'Pending' | 'In Progress' | 'Failed' | 'Succeeded' | undefined,
      scheduledLastDays,
    });

    if (results.length === 0) {
      this.warn('No results found');
    } else {
      const data = await Promise.all(
        results.map(async (record: PackagePushRequestListResult) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const packagePushRequestId = record?.Id;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const packagePushRequestOptions = { packagePushRequestId };

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          const totalNumOrgs = await PackagePushUpgrade.getTotalJobs(connection, packagePushRequestOptions);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          const numOrgsUpgradedFail = await PackagePushUpgrade.getFailedJobs(connection, packagePushRequestOptions);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          const numOrgsUpgradedSuccess = await PackagePushUpgrade.getSucceededJobs(
            connection,
            packagePushRequestOptions
          );
          
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const pv = record?.PackageVersion;
          const packageVersionNumber = 
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            pv?.MajorVersion != null && 
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            pv?.MinorVersion != null ? 
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
            `${pv.MajorVersion}.${pv.MinorVersion}` : 
            undefined;

          return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            Id: record?.Id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            PackageVersionId: record?.PackageVersionId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            PackageVersionName: pv?.Name,
            PackageVersionNumber: packageVersionNumber,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            Status: record?.Status,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            ScheduledStartTime: record?.ScheduledStartTime,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            StartTime: record?.StartTime,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            EndTime: record?.EndTime,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            NumOrgsScheduled: totalNumOrgs,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            NumOrgsUpgradedFail: numOrgsUpgradedFail,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            NumOrgsUpgradedSuccess: numOrgsUpgradedSuccess,
          };
        })
      );

      this.table({ data });
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return results;
  }
}
