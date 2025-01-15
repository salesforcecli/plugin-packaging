/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import {
  PackagePushUpgrade,
  PackagePushRequestReportResult,
  PackagePushRequestReportJobFailuresResult,
} from '@salesforce/packaging';
import chalk from 'chalk';
import { requiredHubFlag } from '../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_pushupgrade_report');
const ERROR_LIMIT = 12;

export type ReportCommandResult = null | PackagePushRequestReportResult;

export class PackagePushUpgradeReportCommand extends SfCommand<ReportCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:pushupgrade:report'];
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    // eslint-disable-next-line sf-plugin/id-flag-suggestions
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
    const connection = flags['target-dev-hub'].getConnection(flags['api-version']);

    const packagePushRequestOptions = { packagePushRequestId: flags['push-request-id'] };

    const records = await PackagePushUpgrade.report(connection, packagePushRequestOptions);
    if (records?.length === 1) {
      const record = records[0];

      const totalJobs = await PackagePushUpgrade.getTotalJobs(connection, packagePushRequestOptions);

      let failedJobs = 0;
      let succeededJobs = 0;
      let jobFailureReasons;

      if (record?.Status === 'Succeeded' || record?.Status === 'Failed' || record?.Status === 'In Progress') {
        failedJobs = await PackagePushUpgrade.getFailedJobs(connection, packagePushRequestOptions);
        succeededJobs = await PackagePushUpgrade.getSucceededJobs(connection, packagePushRequestOptions);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        jobFailureReasons = await PackagePushUpgrade.getJobFailureReasons(connection, packagePushRequestOptions);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      this.display(records[0], totalJobs, succeededJobs, failedJobs, jobFailureReasons);
      return record;
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        value: record.PackageVersion.MetadataPackage.Name,
      },
      {
        name: 'Package Version Name',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        value: record.PackageVersion.Name,
      },
      {
        name: 'Namespace',
        value: record.PackageVersion.MetadataPackage.NamespacePrefix,
      },
      {
        name: 'Package Id',
        value: record.PackageVersion.MetadataPackageId,
      },
      {
        name: 'Package Version Id',
        value: record.PackageVersionId,
      },
      {
        name: 'Package Push Request Id',
        value: record.Id,
      },
      {
        name: 'Status',
        value: record.Status,
      },
      {
        name: 'Scheduled Start Time',
        value: record.ScheduledStartTime,
      },
      {
        name: 'Start Time',
        value: record.StartTime,
      },
      {
        name: 'End Time',
        value: record.EndTime,
      },
      {
        name: 'Duration Seconds',
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

    this.table({ data, title: chalk.blue('Push Upgrade Request') });

    if (jobFailureReasons?.length) {
      this.log('');
      const errors: string[] = [];
      jobFailureReasons.slice(0, ERROR_LIMIT).forEach((error: PackagePushRequestReportJobFailuresResult) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        errors.push(`(${errors.length + 1}) ${error.ErrorMessage}`);
      });
      this.styledHeader(chalk.red('Errors'));
      this.warn(errors.join('\n'));

      // Check if errors were truncated.  If so, inform the user with
      // instructions on how to retrieve the remaining errors.
      if (jobFailureReasons?.length > ERROR_LIMIT) {
        this.warn(messages.getMessage('truncatedErrors', [this.config.bin, record.Id]));
      }
    }
  }
}
