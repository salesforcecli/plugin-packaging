/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages, Logger } from '@salesforce/core';
import chalk from 'chalk';

import {
  PackagePushUpgrade,
  PackagePushRequestReportResult,
  PackagePushRequestReportJobFailuresResult,
} from '@salesforce/packaging';
import { requiredHubFlag } from '../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_pushupgrade_report');
const ERROR_LIMIT = 12;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type ReportCommandResult = PackagePushRequestReportResult | null;

export class PackagePushUpgradeReportCommand extends SfCommand<ReportCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:pushupgrade:report'];
  public static readonly hidden = true;
  public static readonly state = 'beta';
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    'push-request-id': Flags.salesforceId({
      length: 'both',
      deprecateAliases: true,
      aliases: ['pushrequestid'],
      char: 'i',
      summary: messages.getMessage('flags.push-request-id.summary'),
      required: true,
    }),
  };

  public async run(): Promise<ReportCommandResult> {
    const { flags } = await this.parse(PackagePushUpgradeReportCommand);
    const logger = await Logger.child(this.constructor.name);
    const hubOrg = flags['target-dev-hub'];
    const connection = hubOrg.getConnection(flags['api-version']);

    const packagePushRequestOptions = { packagePushRequestId: flags['push-request-id'] };

    logger.debug(
      `Querying PackagePushRequestReport records from org ${hubOrg?.getOrgId()} using PackagePushRequest ID: ${packagePushRequestOptions.packagePushRequestId}`
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const records: PackagePushRequestReportResult[] = await PackagePushUpgrade.report(connection, packagePushRequestOptions);

    if (records?.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const record: PackagePushRequestReportResult = records[0];
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      logger.debug(`Found PackagePushRequestReport record: ${record?.Id}`);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const totalJobs: number = await PackagePushUpgrade.getTotalJobs(connection, packagePushRequestOptions);

      let failedJobs = 0;
      let succeededJobs = 0;
      let jobFailureReasons: PackagePushRequestReportJobFailuresResult[] | undefined;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
      if (record?.Status === 'Succeeded' || record?.Status === 'Failed' || record?.Status === 'In Progress') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        logger.debug(`PushRequest Status is ${record.Status}, getting job details.`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        failedJobs = await PackagePushUpgrade.getFailedJobs(connection, packagePushRequestOptions);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        succeededJobs = await PackagePushUpgrade.getSucceededJobs(connection, packagePushRequestOptions);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        jobFailureReasons = await PackagePushUpgrade.getJobFailureReasons(connection, packagePushRequestOptions);
      }
      this.display(record, totalJobs, succeededJobs, failedJobs, jobFailureReasons);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return record;
    }
    this.warn('No results found');
    return null;
  }

  private display(
    record: PackagePushRequestReportResult,
    totalJobs: number,
    succeededJobs: number,
    failedJobs: number,
    jobFailureReasons?: PackagePushRequestReportJobFailuresResult[]
  ): void {
    const data = [
      {
        name: 'Package Name',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        value: record.PackageVersion.MetadataPackage.Name,
      },
      {
        name: 'Package Version Name',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        value: record.PackageVersion.Name,
      },
      {
        name: 'Package Version',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
        value: record.PackageVersion.MajorVersion + '.' + record.PackageVersion.MinorVersion,
      },
      {
        name: 'Namespace',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        value: record.PackageVersion.MetadataPackage.NamespacePrefix,
      },
      {
        name: 'Package Id',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        value: record.PackageVersion.MetadataPackageId,
      },
      {
        name: 'Package Version Id',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        value: record.PackageVersionId,
      },
      {
        name: 'Package Push Request Id',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        value: record.Id,
      },
      {
        name: 'Status',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        value: record.Status,
      },
      {
        name: 'Scheduled Start Time',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        value: record.ScheduledStartTime,
      },
      {
        name: 'Start Time',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        value: record.StartTime,
      },
      {
        name: 'End Time',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        value: record.EndTime,
      },
      {
        name: 'Duration Seconds',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        value: record.DurationSeconds,
      },
      {
        name: '# Orgs Scheduled',
        value: totalJobs,
      },
      {
        name: '# Orgs Upgrade Succeeded',
        value: succeededJobs,
      },
      {
        name: '# Orgs Upgrade Failed',
        value: failedJobs,
      },
    ];

    this.table({ data });

    if (jobFailureReasons?.length) {
      this.log('');
      const errors: string[] = [];
      jobFailureReasons.slice(0, ERROR_LIMIT).forEach((error: PackagePushRequestReportJobFailuresResult) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        errors.push(`(${errors.length + 1}) ${error.ErrorMessage}`);
      });
      this.styledHeader(chalk.red('Errors'));
      this.warn(errors.join('\n'));

      if (jobFailureReasons?.length > ERROR_LIMIT) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.warn(messages.getMessage('truncatedErrors', [this.config.bin, record.Id]));
      }
    }
  }
}
