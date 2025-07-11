/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Connection, Messages } from '@salesforce/core';
import {
  PackageVersion,
  getPackageVersionNumber,
  BundleSObjects,
  PackageBundleVersionCreate,
} from '@salesforce/packaging';
import chalk from 'chalk';
import { requiredHubFlag } from '../../../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_version_create_list');

type Status = BundleSObjects.PkgBundleVersionCreateReqStatus;
export type PackageBundleVersionCreateRequestResults = BundleSObjects.PackageBundleVersionCreateRequestResult[];

export class PackageBundleVersionCreateListCommand extends SfCommand<PackageBundleVersionCreateRequestResults> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    'created-last-days': Flags.integer({
      char: 'c',
      deprecateAliases: true,
      aliases: ['createdlastdays'],
      summary: messages.getMessage('flags.created-last-days.summary'),
    }),
    status: Flags.custom<Status>({
      options: [
        BundleSObjects.PkgBundleVersionCreateReqStatus.queued,
        BundleSObjects.PkgBundleVersionCreateReqStatus.success,
        BundleSObjects.PkgBundleVersionCreateReqStatus.error,
      ],
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

  public async run(): Promise<PackageBundleVersionCreateRequestResults> {
    const { flags } = await this.parse(PackageBundleVersionCreateListCommand);
    this.connection = flags['target-dev-hub'].getConnection(flags['api-version']);
    let results = await PackageBundleVersionCreate.getCreateStatuses(
      this.connection,
      flags.status,
      flags['created-last-days']
    );

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
        Id: r.Id ?? 'N/A',
        Status: r.RequestStatus ?? 'Unknown',
        'Package Bundle Id': r.PackageBundleId ?? 'N/A',
        'Package Bundle Version Id': r.PackageBundleVersionId ?? 'N/A',
        'Created Date': r.CreatedDate ?? 'N/A',
        'Created By': r.CreatedById ?? 'N/A',
        ...(flags.verbose
          ? {
              'Version Name': r.VersionName ?? 'N/A',
              'Major Version': r.MajorVersion ?? 'N/A',
              'Minor Version': r.MinorVersion ?? 'N/A',
            }
          : {}),
      }));

      this.table({
        data,
        overflow: 'wrap',
        title: chalk.blue(`Package Bundle Version Create Requests  [${results.length}]`),
      });
    }

    return results;
  }

  // Queries Package2Version for the name and version number of the packages and adds that data
  // to the results.
  private async fetchVerboseData(
    results: PackageBundleVersionCreateRequestResults
  ): Promise<PackageBundleVersionCreateRequestResults> {
    type VersionDataMap = {
      [id: string]: { name: string; version: string };
    };

    // Filter out any results without a valid PackageBundleVersionId
    const validResults = results.filter((r) => r?.PackageBundleVersionId);
    if (validResults.length === 0) {
      return results;
    }

    // Query for the version name and number data
    const versionData = await PackageVersion.queryPackage2Version(this.connection, {
      fields: ['Id', 'Name', 'MajorVersion', 'MinorVersion', 'PatchVersion', 'BuildNumber'],
      whereClause: "WHERE Id IN ('%IDS%')",
      whereClauseItems: validResults.map((pvcrr) => pvcrr.PackageBundleVersionId),
    });

    const vDataMap: VersionDataMap = {};
    versionData.forEach((vData) => {
      if (vData?.Id) {
        const version = getPackageVersionNumber(vData, true);
        vDataMap[vData.Id] = { name: vData.Name, version };
      }
    });

    return results.map((pvcrr) => {
      if (pvcrr?.PackageBundleVersionId && vDataMap[pvcrr.PackageBundleVersionId]) {
        return {
          ...pvcrr,
          ...{
            VersionName: vDataMap[pvcrr.PackageBundleVersionId].name,
            VersionNumber: vDataMap[pvcrr.PackageBundleVersionId].version,
          },
        };
      }
      return pvcrr;
    });
  }
}
