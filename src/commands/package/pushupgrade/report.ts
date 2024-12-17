/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
// import { Messages, Org } from '@salesforce/core';
import { Messages } from '@salesforce/core';

// import pkgUtils, { PackagePushRequestResult } from '@salesforce/packaging';
import { PackagePushUpgrade, PackagePushRequestReportResult } from '@salesforce/packaging';
// import chalk from 'chalk';
// import { camelCaseToTitleCase } from '@salesforce/kit';
import chalk from 'chalk';
import { requiredHubFlag } from '../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_pushupgrade_report');
// const pvclMessages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create_list');
// const pvlMessages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_list');
// const plMessages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_list');
// const ERROR_LIMIT = 12;

export type PackagePushRequestReportDetails = {
  PackageName: string;
  NamespacePrefix: string;
  PackageId: string;
  PackageVersionId: string;
  PackageVersionName: string;
  PackagePushRequestId: string;
  Status: string;
  ScheduledStartTime: string;
  InstallUrl: string;
  AncestorVersion: string;
  Alias: string;
  IsOrgDependent: 'N/A' | 'Yes' | 'No';
  CreatedBy: string;
  ValidatedAsync?: boolean;
};

export type ReportCommandResult = null | PackagePushRequestReportResult[];

export class PackagePushUpgradeReportCommand extends SfCommand<ReportCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:pushupgrade:report'];
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    // eslint-disable-next-line sf-plugin/id-flag-suggestions
    'package-push-request-id': Flags.salesforceId({
      length: 'both',
      deprecateAliases: true,
      aliases: ['packagepushrequestid'],
      char: 'i',
      summary: messages.getMessage('flags.package-push-request-id.summary'),
      required: true,
    }),
  };

  public async run(): Promise<ReportCommandResult> {
    const { flags } = await this.parse(PackagePushUpgradeReportCommand);
    const connection = flags['target-dev-hub'].getConnection(flags['api-version']);

    const packagePushRequestOptions = { packagePushRequestId: flags['package-push-request-id'] };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const records = await PackagePushUpgrade.report(connection, packagePushRequestOptions);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (records?.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const record = records[0];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const totalJobs = await PackagePushUpgrade.getTotalJobs(connection, packagePushRequestOptions);

      let failedJobs;
      let succeededJobs;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (record?.Status === 'Succeeded' || record?.Status === 'Failed') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        failedJobs = await PackagePushUpgrade.getFailedJobs(connection, packagePushRequestOptions);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        succeededJobs = await PackagePushUpgrade.getSucceededJobs(connection, packagePushRequestOptions);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      this.display(records[0], totalJobs, succeededJobs, failedJobs);
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
  private display(
    record: PackagePushRequestReportResult,
    totalJobs: number,
    succeededJobs?: number,
    failedJobs?: number
  ): void {
    const data = [
      // {
      //   name: 'PackageName',
      //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      //   value: record.PackageVersion.MetadataPackage.Name
      // },
      // {
      //   name: 'Namespace',
      //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      //   value: record.PackageVersion.MetadataPackage.NamespacePrefix,
      // },
      // {
      //   name: 'PackageId',
      //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      //   value: record.PackageVersion.MetadataPackageId,
      // },
      // {
      //   name: 'PackageVersionId',
      //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      //   value: record.PackageVersionId,
      // },
      // {
      //   name: 'PackageVersionName',
      //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      //   value: record.PackageVersion.Name,
      // },
      {
        name: 'PackagePushRequestId',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        value: record.Id,
      },
      {
        name: 'Status',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        value: record.Status,
      },
      {
        name: 'ScheduledStartTime',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        value: record.ScheduledStartTime,
      },
      {
        name: 'StartTime',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        value: record.StartTime,
      },
      {
        name: 'EndTime',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        value: record.EndTime,
      },
      {
        name: 'TotalJobs',
        value: totalJobs,
      },
      {
        name: 'SucceededJobs',
        value: succeededJobs,
      },
      {
        name: 'FailedJobs',
        value: failedJobs,
      },
      // {
      //   name: 'DurationMinutes',
      //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      //   value: record.DurationSeconds / 60,
      // },
    ];

    this.table({ data, title: chalk.blue('Package Push Request') });

    // if (record.Error?.length > 0) {
    //   this.log('');
    //   const errors: string[] = [];
    //   record.Error.slice(0, ERROR_LIMIT).forEach((error: string) => {
    //     errors.push(`(${errors.length + 1}) ${error}`);
    //   });
    //   this.styledHeader(chalk.red('Errors'));
    //   this.warn(errors.join('\n'));

    //   // Check if errors were truncated.  If so, inform the user with
    //   // instructions on how to retrieve the remaining errors.
    //   if (record.Error.length > ERROR_LIMIT) {
    //     this.warn(messages.getMessage('truncatedErrors', [this.config.bin, requestId, devOrg.getUsername() as string]));
    //   }
    // }
  }
}
