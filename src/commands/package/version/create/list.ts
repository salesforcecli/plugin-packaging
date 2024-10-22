/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Connection, Messages } from '@salesforce/core';
import { PackageVersion, PackageVersionCreateRequestResult, getPackageVersionNumber } from '@salesforce/packaging';
import chalk from 'chalk';
import { requiredHubFlag } from '../../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create_list');
const packaging = Messages.loadMessages('@salesforce/plugin-packaging', 'packaging');

export type CreateListCommandResult = Array<
  PackageVersionCreateRequestResult & {
    VersionName?: string;
    VersionNumber?: string;
  }
>;

type Status = 'Queued' | 'InProgress' | 'Success' | 'Error';

export class PackageVersionCreateListCommand extends SfCommand<CreateListCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:version:create:list'];
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    'created-last-days': Flags.integer({
      char: 'c',
      deprecateAliases: true,
      aliases: ['createdlastdays'],
      summary: packaging.getMessage('flags.created-last-days.summary'),
    }),
    status: Flags.custom<Status>({
      options: ['Queued', 'InProgress', 'Success', 'Error'],
    })({
      char: 's',
      summary: messages.getMessage('flags.status.summary'),
    }),
    'show-conversions-only': Flags.boolean({
      summary: messages.getMessage('flags.show-conversions-only.summary'),
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  private connection!: Connection;

  public async run(): Promise<CreateListCommandResult> {
    const { flags } = await this.parse(PackageVersionCreateListCommand);
    this.connection = flags['target-dev-hub'].getConnection(flags['api-version']);
    let results = (await PackageVersion.getPackageVersionCreateRequests(this.connection, {
      createdlastdays: flags['created-last-days'],
      status: flags.status,
      showConversionsOnly: flags['show-conversions-only'],
    })) as CreateListCommandResult;

    if (results.length === 0) {
      this.warn('No results found');
    } else {
      this.styledHeader(chalk.blue(`Package Version Create Requests  [${results.length}]`));
      const columnData = [
        { name: 'Id', key: 'Id' },
        { name: 'Status', key: messages.getMessage('status') },
        { name: 'Package2Id', key: messages.getMessage('package-id') },
        { name: 'Package2VersionId', key: messages.getMessage('packageVersionId') },
        { name: 'SubscriberPackageVersionId', key: messages.getMessage('subscriberPackageVersionId') },
        { name: 'Tag', key: messages.getMessage('tag') },
        { name: 'Branch', key: messages.getMessage('branch') },
        { name: 'CreatedDate', key: 'Created Date' },
        { name: 'CreatedBy', key: messages.getMessage('createdBy') },
      ];

      if (flags['show-conversions-only']) {
        columnData.push({ name: 'ConvertedFromVersionId', key: messages.getMessage('convertedFromVersionId') });
      }

      if (flags.verbose) {
        try {
          results = await this.fetchVerboseData(results);
          columnData.push({ key: 'VersionName', name: 'Version Name' });
          columnData.push({ key: 'VersionNumber', name: 'Version Number' });
        } catch (err) {
          const errMsg = typeof err === 'string' ? err : err instanceof Error ? err.message : 'unknown error';
          this.warn(`error when retrieving verbose data (package name and version) due to: ${errMsg}`);
        }
      } // @ts-expect-error sdfsdfs

      this.table({ data: results, columns: columnData });
    }

    return results;
  }

  // Queries Package2Version for the name and version number of the packages and adds that data
  // to the results.
  private async fetchVerboseData(results: CreateListCommandResult): Promise<CreateListCommandResult> {
    type VersionDataMap = {
      [id: string]: { name: string; version: string };
    };
    // Query for the version name and number data
    const versionData = await PackageVersion.queryPackage2Version(this.connection, {
      fields: ['Id', 'Name', 'MajorVersion', 'MinorVersion', 'PatchVersion', 'BuildNumber'],
      whereClause: "WHERE Id IN ('%IDS%')",
      whereClauseItems: results.map((pvcrr) => pvcrr.Package2VersionId).filter(Boolean),
    });

    const vDataMap: VersionDataMap = {};
    versionData.map((vData) => {
      if (vData) {
        const version = getPackageVersionNumber(vData, true);
        vDataMap[vData.Id] = { name: vData.Name, version };
      }
    });

    return results.map((pvcrr) => {
      if (vDataMap[pvcrr.Package2VersionId]) {
        return {
          ...pvcrr,
          ...{
            VersionName: vDataMap[pvcrr.Package2VersionId].name,
            VersionNumber: vDataMap[pvcrr.Package2VersionId].version,
          },
        };
      } else return pvcrr;
    });
  }
}
