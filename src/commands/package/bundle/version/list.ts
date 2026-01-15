/*
 * Copyright 2026, Salesforce, Inc.
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
import { Connection, Messages } from '@salesforce/core';
import { BundleSObjects, PackageBundleVersion } from '@salesforce/packaging';
import chalk from 'chalk';
import { requiredHubFlag } from '../../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_version_list');

export type PackageBundleVersionResults = BundleSObjects.BundleVersion[];

export class PackageBundleVersionListCommand extends SfCommand<PackageBundleVersionResults> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  private connection!: Connection;

  public async run(): Promise<PackageBundleVersionResults> {
    const { flags } = await this.parse(PackageBundleVersionListCommand);
    this.connection = flags['target-dev-hub'].getConnection(flags['api-version']);
    const results = await PackageBundleVersion.list(this.connection);

    if (results.length === 0) {
      this.warn('No results found');
    } else {
      const data = results.map((r) => ({
        'Bundle Name': r.PackageBundle.BundleName,
        'Bundle Id': r.PackageBundle.Id,
        'Bundle Version Number': String(r.MajorVersion) + '.' + String(r.MinorVersion),
        'Bundle Version Id': r.Id,
        'Bundle Version Name': r.VersionName,
        'Bundle Version Description': r.PackageBundle.Description,
        ...(flags.verbose
          ? {
              'Ancestor Id': r.Ancestor?.Id,
              'Ancestor Name': r.Ancestor?.PackageBundle.BundleName,
              'Ancestor Version Name': r.Ancestor?.VersionName,
              'Ancestor Version': String(r.Ancestor?.MajorVersion) + '.' + String(r.Ancestor?.MinorVersion),
              'Created Date': r.CreatedDate,
              'Created By': r.CreatedById,
              'Last Modified Date': r.LastModifiedDate,
              'Last Modified By': r.LastModifiedById,
            }
          : {}),
      }));

      this.table({
        data,
        overflow: 'wrap',
        title: chalk.blue(`Package Bundle Version List [${results.length}]`),
      });
    }

    return results;
  }
}
