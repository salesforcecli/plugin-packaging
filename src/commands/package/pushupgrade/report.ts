/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages, Org, Logger } from '@salesforce/core';
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
    const hubOrg = flags['target-dev-hub'] as Org;
    const connection = hubOrg.getConnection(flags['api-version']);

    const packagePushRequestOptions = { packagePushRequestId: flags['push-request-id'] as string };

    logger.debug(
      `Querying PackagePushRequestReport records from org ${hubOrg?.getOrgId()} using PackagePushRequest ID: ${packagePushRequestOptions.packagePushRequestId}`
    );
    const records: PackagePushRequestReportResult[] = await PackagePushUpgrade.report(connection, packagePushRequestOptions);

    if (records?.length === 1) {
      const record: PackagePushRequestReportResult = records[0];
      
      logger.debug(`Found PackagePushRequestReport record: ${record?.Id}`);

      const totalJobs: number = await PackagePushUpgrade.getTotalJobs(connection, packagePushRequestOptions);

      let failedJobs = 0;
      let succeededJobs = 0;
      let jobFailureReasons: PackagePushRequestReportJobFailuresResult[] | undefined;

      if (record?.Status === 'Succeeded' || record?.Status === 'Failed' || record?.Status === 'In Progress') {
        logger.debug(`PushRequest Status is ${record.Status}, getting job details.`);
        failedJobs = await PackagePushUpgrade.getFailedJobs(connection, packagePushRequestOptions) as number;
        succeededJobs = await PackagePushUpgrade.getSucceededJobs(connection, packagePushRequestOptions) as number;
        jobFailureReasons = await PackagePushUpgrade.getJobFailureReasons(connection, packagePushRequestOptions);
      }
      this.display(record, totalJobs, succeededJobs, failedJobs, jobFailureReasons);
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
        value: record.PackageVersion.MetadataPackage.Name,
      },
      {
        name: 'Package Version Name',
        value: record.PackageVersion.Name,
      },
      {
        name: 'Package Version',
        value: record.PackageVersion.MajorVersion + '.' + record.PackageVersion.MinorVersion,
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

    this.table({ data });

    if (jobFailureReasons?.length) {
      this.log('');
      const errors: string[] = [];
      jobFailureReasons.slice(0, ERROR_LIMIT).forEach((error: PackagePushRequestReportJobFailuresResult) => {
        errors.push(`(${errors.length + 1}) ${error.ErrorMessage}`);
      });
      this.styledHeader(chalk.red('Errors'));
      this.warn(errors.join('\n'));

      if (jobFailureReasons?.length > ERROR_LIMIT) {
        this.warn(messages.getMessage('truncatedErrors', [this.config.bin, record.Id]));
      }
    }
  }
}
