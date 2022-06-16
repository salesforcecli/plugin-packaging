/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxPropertyKeys } from '@salesforce/core';
import { listPackages, getPackageAliasesFromId, PackagingSObjects } from '@salesforce/packaging';
import * as chalk from 'chalk';
import { CliUx } from '@oclif/core';
import { QueryResult } from 'jsforce';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_list');

export type Package2Result = Partial<
  Pick<
    PackagingSObjects.Package2,
    | 'Id'
    | 'SubscriberPackageId'
    | 'Name'
    | 'Description'
    | 'NamespacePrefix'
    | 'ContainerOptions'
    | 'ConvertedFromPackageId'
    | 'PackageErrorUsername'
  > & {
    Alias: string;
    CreatedBy: string;
    IsOrgDependent: string;
  }
>;

export class PackageListCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly longDescription = messages.getMessage('cliLongDescription');
  public static readonly help = messages.getMessage('help');
  public static readonly requiresProject = true;
  public static readonly orgType = SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME;
  public static readonly requiresDevhubUsername = true;
  public static readonly flagsConfig: FlagsConfig = {
    verbose: flags.builtin({
      description: messages.getMessage('verboseDescription'),
      longDescription: messages.getMessage('verboseLongDescription'),
    }),
  };

  private results: Package2Result[] = [];

  public async run(): Promise<Package2Result[]> {
    this.logger = this.logger.child('package:list');
    const queryResult = await listPackages(this.hubOrg.getConnection());
    this.mapRecordsToResults(queryResult);
    if (!this.flags.json) {
      this.displayResults();
    }
    return this.results;
  }

  private mapRecordsToResults(queryResult: QueryResult<PackagingSObjects.Package2>): void {
    const { records } = queryResult;
    if (records && records.length > 0) {
      this.results = records.map(
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
          CreatedById,
        }) => {
          return {
            Id,
            SubscriberPackageId,
            Name,
            Description,
            NamespacePrefix,
            ContainerOptions,
            ConvertedFromPackageId,
            Alias: getPackageAliasesFromId(Id, this.project).join(),
            IsOrgDependent: ContainerOptions === 'Managed' ? 'N/A' : IsOrgDependent === true ? 'Yes' : 'No',
            PackageErrorUsername,
            CreatedBy: CreatedById,
          } as Package2Result;
        }
      );
    }
  }

  private displayResults(): void {
    CliUx.ux.styledHeader(chalk.blue(`Packages [${this.results.length}]`));
    const columns = {
      NamespacePrefix: { header: messages.getMessage('namespace') },
      Name: { header: messages.getMessage('name') },
      Id: { header: messages.getMessage('id') },
      Alias: { header: messages.getMessage('alias') },
      Description: { header: messages.getMessage('description') },
      ContainerOptions: {
        header: messages.getMessage('packageType'),
      },
    };

    if (this.flags.verbose) {
      Object.assign(columns, {
        SubscriberPackageId: { header: messages.getMessage('packageId') },
        ConvertedFromPackageId: { header: messages.getMessage('convertedFromPackageId') },
        IsOrgDependent: { header: messages.getMessage('isOrgDependent') },
        PackageErrorUsername: { header: messages.getMessage('errorNotificationUsername') },
        CreatedBy: {
          header: messages.getMessage('createdBy'),
        },
      });
    }
    CliUx.ux.table(this.results, columns);
  }
}
