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
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Connection, Messages } from '@salesforce/core';
import { BundleSObjects, PackageBundleInstall } from '@salesforce/packaging';
import chalk from 'chalk';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_install_list');

type Status = BundleSObjects.PkgBundleVersionInstallReqStatus;
export type PackageBundleInstallRequestResults = BundleSObjects.PkgBundleVersionInstallReqResult[];

export class PackageBundleInstallListCommand extends SfCommand<PackageBundleInstallRequestResults> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    'created-last-days': Flags.integer({
      char: 'c',
      summary: messages.getMessage('flags.created-last-days.summary'),
    }),
    status: Flags.custom<Status>({
      options: [
        BundleSObjects.PkgBundleVersionInstallReqStatus.queued,
        BundleSObjects.PkgBundleVersionInstallReqStatus.success,
        BundleSObjects.PkgBundleVersionInstallReqStatus.error,
      ],
    })({
      char: 's',
      summary: messages.getMessage('flags.status.summary'),
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  private connection!: Connection;

  public async run(): Promise<PackageBundleInstallRequestResults> {
    const { flags } = await this.parse(PackageBundleInstallListCommand);
    this.connection = flags['target-org'].getConnection(flags['api-version']);
    const results = await PackageBundleInstall.getInstallStatuses(
      this.connection,
      flags.status,
      flags['created-last-days']
    );

    if (results.length === 0) {
      this.warn('No results found');
    } else {
      const data = results.map((r) => ({
        Id: r.Id ?? 'N/A',
        Status: r.InstallStatus ?? 'Unknown',
        'Package Bundle Version Id': r.PackageBundleVersionID ?? 'N/A',
        'Development Organization': r.DevelopmentOrganization ?? 'N/A',
        'Created Date': r.CreatedDate ?? 'N/A',
        'Created By': r.CreatedById ?? 'N/A',
        ...(flags.verbose
          ? {
              'Validation Error': r.ValidationError ?? 'N/A',
            }
          : {}),
      }));

      this.table({
        data,
        overflow: 'wrap',
        title: chalk.blue(`Package Bundle Install Requests  [${results.length}]`),
      });
    }

    return results;
  }
}
