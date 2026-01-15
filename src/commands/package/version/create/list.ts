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
      if (flags.verbose) {
        try {
          results = await this.fetchVerboseData(results);
        } catch (err) {
          const errMsg = typeof err === 'string' ? err : err instanceof Error ? err.message : 'unknown error';
          this.warn(`error when retrieving verbose data (package name and version) due to: ${errMsg}`);
        }
      }

      const data = results.map((r) => ({
        Id: r.Id,
        Status: r.Status,
        'Package Id': r.Package2Id,
        'Package Version Id': r.Package2VersionId,
        'Subscriber Package Version Id': r.SubscriberPackageVersionId,
        Tag: r.Tag,
        Branch: r.Branch,
        'Created Date': r.CreatedDate,
        'Created By': r.CreatedBy,
        ...(flags['show-conversions-only'] ? { 'Converted From Version Id': r.ConvertedFromVersionId } : {}),
        ...(flags.verbose ? { 'Version Name': r.VersionName, 'Version Number': r.VersionNumber } : {}),
      }));

      this.table({ data, overflow: 'wrap', title: chalk.blue(`Package Version Create Requests  [${results.length}]`) });
    }

    // Filter out unwanted fields from JSON output
    // TotalNumberOfMetadataFiles and TotalSizeOfMetadataFiles are intentionally excluded from display
    const filteredResults = results.map((r) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { TotalNumberOfMetadataFiles, TotalSizeOfMetadataFiles, ...filteredResult } = r;
      return filteredResult;
    });

    return filteredResults as CreateListCommandResult;
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
