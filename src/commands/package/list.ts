/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
    this.styledHeader(chalk.blue(`Packages [${results.length}]`));
    let columns = [
      { key: 'NamespacePrefix', name: messages.getMessage('namespace') },
      { key: 'Name', name: messages.getMessage('name') },
      { key: 'Id', name: messages.getMessage('id') },
      { key: 'Alias', name: messages.getMessage('alias') },
      { key: 'Description', name: messages.getMessage('description') },
      { key: 'ContainerOptions', name: messages.getMessage('package-type') },
    ];

    if (verbose) {
      columns = columns.concat([
        { name: 'SubscriberPackageId', key: messages.getMessage('package-id') },
        { name: 'ConvertedFromPackageId', key: messages.getMessage('convertedFromPackageId') },
        { name: 'IsOrgDependent', key: messages.getMessage('isOrgDependent') },
        { name: 'PackageErrorUsername', key: messages.getMessage('error-notification-username') },
        { name: 'CreatedBy', key: messages.getMessage('createdBy') },
      ]);

      if (parseInt(apiVersion, 10) >= 59) {
        columns.push({ name: 'AppAnalyticsEnabled', key: messages.getMessage('app-analytics-enabled') });
      }
    }
    // @ts-expect-error sdfsdfs
    this.table({ data: results, columns });
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
