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

import {
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Connection, Messages } from '@salesforce/core';
import { BundleSObjects, PackageBundleInstalledList } from '@salesforce/packaging';
import chalk from 'chalk';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_installed_list');

export type PackageBundleInstalledListResults = BundleSObjects.InstalledPackageBundleVersion[];

export class PackageBundleInstalledListCommand extends SfCommand<PackageBundleInstalledListResults> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
  };

  private targetOrgConnection!: Connection;

  private static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  }

  public async run(): Promise<PackageBundleInstalledListResults> {
    const { flags } = await this.parse(PackageBundleInstalledListCommand);
    this.targetOrgConnection = flags['target-org'].getConnection(flags['api-version']);

    const results = await PackageBundleInstalledList.getInstalledBundles(this.targetOrgConnection);

    if (results.length === 0) {
      this.warn('No installed package bundles found in the target org');
      return results;
    }

    // Display each bundle with its own tables
    for (const bundle of results) {
      // Bundle info table
      const bundleInfo = [
        {
          Key: 'Bundle Name',
          Value: bundle.BundleName,
        },
        {
          Key: 'Bundle ID',
          Value: bundle.BundleId,
        },
        {
          Key: 'Bundle Version ID',
          Value: bundle.BundleVersionId,
        },
        {
          Key: 'Bundle Version Name',
          Value: bundle.BundleVersionName,
        },
        {
          Key: 'Major Version',
          Value: bundle.MajorVersion.toString(),
        },
        {
          Key: 'Minor Version',
          Value: bundle.MinorVersion.toString(),
        },
        {
          Key: 'Description',
          Value: bundle.Description || 'N/A',
        },
        {
          Key: 'Installed Date',
          Value: PackageBundleInstalledListCommand.formatDate(bundle.InstalledDate),
        },
        {
          Key: 'Last Upgraded Date',
          Value: PackageBundleInstalledListCommand.formatDate(bundle.LastUpgradedDate),
        },
      ];

      this.table({
        data: bundleInfo,
        overflow: 'wrap',
      });

      // Add spacing
      this.log('');

      // Associated packages table
      if (bundle.Components && bundle.Components.length > 0) {
        this.log(chalk.blue('Associated Packages'));
        const packageData = bundle.Components.map((comp: BundleSObjects.InstalledPackageBundleVersionComponent) => ({
          'Expected Package': comp.ExpectedPackageName,
          'Expected Package Version Number': comp.ExpectedPackageVersionNumber,
          'Actual Package': comp.ActualPackageName,
          'Actual Package Version Number': comp.ActualPackageVersionNumber,
        }));

        this.table({
          data: packageData,
          overflow: 'wrap',
        });
      }

      // Add spacing between bundles
      this.log('');
      this.log('');
    }

    return results;
  }
}
