/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Connection, Messages } from '@salesforce/core';
import { PackageVersion, getPackageVersionNumber, BundleSObjects, PackageBundleVersion } from '@salesforce/packaging';
import chalk from 'chalk';
import { requiredHubFlag } from '../../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_version_list');

export type PackageBundleVersionResults = BundleSObjects.BundleVersion[];

export class PackageBundleVersionListCommand extends SfCommand<PackageBundleVersionResults> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:bundle:version:list'];
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
    let results = await PackageBundleVersion.list(this.connection);

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
        'Bundle Name': r.PackageBundle.BundleName ?? 'N/A',
        'Bundle Id': r.PackageBundle.Id ?? 'N/A',
        'Bundle Version Number': String(r.MajorVersion ?? 'N/A') + '.' + String(r.MinorVersion ?? 'N/A'),
        'Bundle Version Id': r.Id ?? 'N/A',
        'Bundle Version Name': r.VersionName ?? 'N/A',
        'Bundle Version Description': r.PackageBundle.Description ?? 'N/A',
        ...(flags.verbose
          ? {
              'Ancestor Id': r.Ancestor?.Id ?? 'N/A',
              'Ancestor Name': r.Ancestor?.PackageBundle.BundleName ?? 'N/A',
              'Ancestor Version Name': r.Ancestor?.VersionName ?? 'N/A',
              'Ancestor Version':
                String(r.Ancestor?.MajorVersion ?? 'N/A') + '.' + String(r.Ancestor?.MinorVersion ?? 'N/A'),
              'Created Date': r.CreatedDate ?? 'N/A',
              'Created By': r.CreatedById ?? 'N/A',
              'Last Modified Date': r.LastModifiedDate ?? 'N/A',
              'Last Modified By': r.LastModifiedById ?? 'N/A',
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

  // Queries Package2Version for the name and version number of the packages and adds that data
  // to the results.
  private async fetchVerboseData(results: PackageBundleVersionResults): Promise<PackageBundleVersionResults> {
    type VersionDataMap = {
      [id: string]: { name: string; version: string };
    };

    // Filter out any results without a valid PackageBundleVersionId
    const validResults = results.filter((r) => r?.Id);
    if (validResults.length === 0) {
      return results;
    }

    // Query for the version name and number data
    const versionData = await PackageVersion.queryPackage2Version(this.connection, {
      fields: [
        'Id',
        'Name',
        'MajorVersion',
        'MinorVersion',
        'PatchVersion',
        'BuildNumber',
        'CreatedDate',
        'CreatedById',
        'LastModifiedDate',
        'LastModifiedById',
        'SystemModstamp',
      ],
      whereClause: "WHERE Id IN ('%IDS%')",
      whereClauseItems: validResults.map((pvcrr) => pvcrr.Id),
    });

    const vDataMap: VersionDataMap = {};
    versionData.forEach((vData) => {
      if (vData?.Id) {
        const version = getPackageVersionNumber(vData, true);
        vDataMap[vData.Id] = { name: vData.Name, version };
      }
    });

    return results.map((pvcrr) => {
      if (pvcrr?.Id && vDataMap[pvcrr.Id]) {
        return {
          ...pvcrr,
          ...{
            VersionName: vDataMap[pvcrr.Id].name,
            VersionNumber: vDataMap[pvcrr.Id].version,
          },
        };
      }
      return pvcrr;
    });
  }
}
