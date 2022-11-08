/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { Package, PackagingSObjects } from '@salesforce/packaging';
import * as chalk from 'chalk';

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
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresProject = true;
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
    const queryResult = await Package.list(this.hubOrg.getConnection());
    this.mapRecordsToResults(queryResult);
    this.displayResults();
    return this.results;
  }

  private mapRecordsToResults(records: PackagingSObjects.Package2[]): void {
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
        }) =>
          ({
            Id,
            SubscriberPackageId,
            Name,
            Description,
            NamespacePrefix,
            ContainerOptions,
            ConvertedFromPackageId,
            Alias: this.project.getAliasesFromPackageId(Id).join(),
            IsOrgDependent: ContainerOptions === 'Managed' ? 'N/A' : IsOrgDependent ? 'Yes' : 'No',
            PackageErrorUsername,
            CreatedBy: CreatedById,
          } as Package2Result)
      );
    }
  }

  private displayResults(): void {
    this.ux.styledHeader(chalk.blue(`Packages [${this.results.length}]`));
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
    this.ux.table(this.results, columns);
  }
}
