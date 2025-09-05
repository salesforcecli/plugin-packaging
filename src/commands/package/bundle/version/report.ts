/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core/messages';
import { PackageBundleVersion, BundleSObjects, PackagingSObjects } from '@salesforce/packaging';
import chalk from 'chalk';
import { requiredHubFlag } from '../../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_version_report');
export type BundleVersionReportResult = BundleSObjects.BundleVersion & {
  componentPackages: PackagingSObjects.SubscriberPackageVersion[];
};

export class PackageBundleVersionReportCommand extends SfCommand<BundleVersionReportResult> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    'bundle-version': Flags.string({
      char: 'b',
      summary: messages.getMessage('flags.bundle-version.summary'),
      required: true,
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  public async run(): Promise<BundleVersionReportResult> {
    const { flags } = await this.parse(PackageBundleVersionReportCommand);
    const connection = flags['target-dev-hub'].getConnection(flags['api-version']);
    const results = await PackageBundleVersion.report(connection, flags['bundle-version']);

    if (!results) {
      throw new Error(`No bundle version found with ID: ${flags['bundle-version']}`);
    }

    const massagedResults = this.massageResultsForDisplay(results);
    this.display(massagedResults, flags.verbose);
    const componentPackages = await PackageBundleVersion.getComponentPackages(connection, flags['bundle-version']);
    const massagedResultsWithComponentPackages = {
      ...massagedResults,
      componentPackages,
    };

    this.displayComponentPackages(componentPackages);
    return massagedResultsWithComponentPackages;
  }

  private display(record: BundleSObjects.BundleVersion, verbose: boolean): void {
    if (this.jsonEnabled()) {
      return;
    }

    // transform the results into a table
    const displayRecords = [
      {
        key: 'Bundle Name',
        value: record.PackageBundle.BundleName,
      },
      {
        key: 'Bundle ID',
        value: record.PackageBundle.Id,
      },
      {
        key: 'Version ID',
        value: record.Id,
      },
      {
        key: 'Version Name',
        value: record.VersionName,
      },
      {
        key: 'Major Version',
        value: record.MajorVersion,
      },
      {
        key: 'Minor Version',
        value: record.MinorVersion,
      },
      {
        key: 'Description',
        value: record.PackageBundle.Description ?? 'N/A',
      },
      {
        key: 'Released',
        value: record.IsReleased ? 'Yes' : 'No',
      },
      {
        key: 'Created Date',
        value: record.CreatedDate,
      },
      {
        key: 'Created By',
        value: record.CreatedById,
      },
      {
        key: 'Last Modified Date',
        value: record.LastModifiedDate,
      },
      {
        key: 'Last Modified By',
        value: record.LastModifiedById,
      },
    ];

    // Add ancestor information if available
    if (record.Ancestor) {
      displayRecords.push(
        {
          key: 'Ancestor ID',
          value: record.Ancestor.Id,
        },
        {
          key: 'Ancestor Version',
          value: `${record.Ancestor.MajorVersion}.${record.Ancestor.MinorVersion}`,
        },
        {
          key: 'Ancestor Bundle Name',
          value: record.Ancestor.PackageBundle.BundleName,
        }
      );
    } else {
      displayRecords.push({
        key: 'Ancestor',
        value: 'N/A',
      });
    }

    // Add verbose information if requested
    if (verbose) {
      displayRecords.push(
        {
          key: 'Bundle Deleted',
          value: record.PackageBundle.IsDeleted ? 'Yes' : 'No',
        },
        {
          key: 'Bundle System Modstamp',
          value: record.PackageBundle.SystemModstamp,
        }
      );
    }

    this.filterVerboseRecords(record, displayRecords, verbose);

    this.table({ data: displayRecords, title: chalk.blue('Package Bundle Version') });
  }

  // eslint-disable-next-line class-methods-use-this
  private filterVerboseRecords(
    bundleRecord: BundleSObjects.BundleVersion,
    displayRecords: Array<Record<string, unknown>>,
    verbose: boolean
  ): void {
    if (!verbose) {
      // Remove verbose fields for non-verbose output
      const verboseKeys = ['Bundle Deleted', 'Bundle System Modstamp'];
      displayRecords.splice(
        0,
        displayRecords.length,
        ...displayRecords.filter((displayRecord) => !verboseKeys.includes(displayRecord.key as string))
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private massageResultsForDisplay(results: BundleSObjects.BundleVersion): BundleSObjects.BundleVersion {
    // For bundle versions, the data is already in the correct format
    // Just return the results as they are
    return results;
  }

  private displayComponentPackages(componentPackages: PackagingSObjects.SubscriberPackageVersion[]): void {
    if (this.jsonEnabled()) {
      return;
    }

    if (componentPackages.length === 0) {
      this.log(chalk.yellow('No component packages found for this bundle version.'));
      return;
    }

    const displayRecords = componentPackages.map((component) => ({
      'Package Name': component.Name,
      'Package Version Number': `${component.MajorVersion}.${component.MinorVersion}.${component.PatchVersion}.${component.BuildNumber}`,
      'Package Version Id': component.Id,
      'Package Id': component.SubscriberPackageId,
    }));

    this.table({ data: displayRecords, title: chalk.blue('Component Packages') });
  }
}
