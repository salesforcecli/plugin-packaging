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
    const columns = {
      NamespacePrefix: { header: messages.getMessage('namespace') },
      Name: { header: messages.getMessage('name') },
      Id: { header: messages.getMessage('id') },
      Alias: { header: messages.getMessage('alias') },
      Description: { header: messages.getMessage('description') },
      ContainerOptions: {
        header: messages.getMessage('package-type'),
      },
      ...(verbose
        ? {
            SubscriberPackageId: { header: messages.getMessage('package-id') },
            ConvertedFromPackageId: { header: messages.getMessage('convertedFromPackageId') },
            IsOrgDependent: { header: messages.getMessage('isOrgDependent') },
            PackageErrorUsername: { header: messages.getMessage('error-notification-username') },
            CreatedBy: { header: messages.getMessage('createdBy') },
          }
        : {}),
      ...(verbose && parseInt(apiVersion, 10) >= 59
        ? { AppAnalyticsEnabled: { header: messages.getMessage('app-analytics-enabled') } }
        : {}),
    };

    this.table(results, columns);
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
