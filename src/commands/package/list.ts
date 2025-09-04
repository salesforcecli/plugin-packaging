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
import { Package, PackagingSObjects } from '@salesforce/packaging';
import chalk from 'chalk';
import { SfProject } from '@salesforce/core';
import { requiredHubFlag } from '../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_list');

export type Package2Result = Required<Pick<PackagingSObjects.Package2, 'Id' | 'Name'>> &
  Partial<
    Pick<
      PackagingSObjects.Package2,
      | 'SubscriberPackageId'
      | 'Description'
      | 'NamespacePrefix'
      | 'ContainerOptions'
      | 'ConvertedFromPackageId'
      | 'PackageErrorUsername'
      | 'AppAnalyticsEnabled'
    > & {
      Alias: string;
      CreatedBy: string;
      IsOrgDependent: string;
    }
  >;

export type PackageListCommandResult = Package2Result[];

export class PackageListCommand extends SfCommand<PackageListCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:list'];
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  public async run(): Promise<PackageListCommandResult> {
    const { flags } = await this.parse(PackageListCommand);
    const connection = flags['target-dev-hub'].getConnection(flags['api-version']);
    const queryResult = await Package.list(connection);
    const results = mapRecordsToResults(queryResult);
    this.displayResults(results, flags.verbose, connection.getApiVersion());
    return results;
  }

  private displayResults(results: Package2Result[], verbose = false, apiVersion: string): void {
    const data = results.map((r) => ({
      'Namespace Prefix': r.NamespacePrefix,
      Name: r.Name,
      Id: r.Id,
      Alias: r.Alias,
      Description: r.Description,
      ContainerOptions: r.ContainerOptions,
      ...(verbose
        ? {
            'Package Id': r.SubscriberPackageId,
            'Converted From Package Id': r.ConvertedFromPackageId,
            'Org-Dependent Unlocked Package': r.IsOrgDependent,
            'Error Notification Username': r.PackageErrorUsername,
            'Created By': r.CreatedBy,
            ...(parseInt(apiVersion, 10) >= 59 ? { 'App Analytics Enabled': r.AppAnalyticsEnabled } : {}),
          }
        : {}),
    }));
    this.table({ data, title: chalk.blue(`Packages [${results.length}]`) });
  }
}

const mapRecordsToResults = (records: PackagingSObjects.Package2[], project?: SfProject): Package2Result[] =>
  records
    .filter((record) => record.IsDeprecated === false)
    .map(
      ({
        Id,
        SubscriberPackageId,
        Name,
        Description,
        NamespacePrefix,
        ContainerOptions,
        ConvertedFromPackageId,
        IsOrgDependent,
        PackageErrorUsername,
        AppAnalyticsEnabled,
        CreatedById,
      }) => ({
        Id,
        SubscriberPackageId,
        Name,
        Description,
        NamespacePrefix,
        ContainerOptions,
        ConvertedFromPackageId,
        Alias: project ? project.getAliasesFromPackageId(Id).join() : '',
        IsOrgDependent: ContainerOptions === 'Managed' ? 'N/A' : IsOrgDependent ? 'Yes' : 'No',
        PackageErrorUsername,
        AppAnalyticsEnabled,
        CreatedBy: CreatedById,
      })
    );
