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
import { Messages } from '@salesforce/core';
import type { TableOptions } from '@oclif/table';
import {
  getContainerOptions,
  getPackageVersionStrings,
  INSTALL_URL_BASE,
  Package,
  PackageVersionListResult,
} from '@salesforce/packaging';
import { requiredHubFlag } from '../../../utils/hubFlag.js';
import { maybeGetProject } from '../../../utils/getProject.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_list');
const packaging = Messages.loadMessages('@salesforce/plugin-packaging', 'packaging');

export type PackageVersionListDetails = Omit<
  PackageVersionListResult,
  | 'HasMetadataRemoved'
  | 'IsReleased'
  | 'IsPasswordProtected'
  | 'HasPassedCodeCoverageCheck'
  | 'CreatedById'
  | 'BuildDurationInSeconds'
  | 'CodeCoverage'
  | 'Package2'
> & {
  HasMetadataRemoved: string;
  IsPasswordProtected: string | boolean;
  IsReleased: string | boolean;
  HasPassedCodeCoverageCheck: string | boolean;
  BuildDurationInSeconds: string | number;
  CodeCoverage: string;
  NamespacePrefix: string;
  Package2Name: string;
  Version: string;
  InstallUrl: string;
  AncestorVersion: string;
  Alias: string;
  IsOrgDependent: 'N/A' | 'Yes' | 'No';
  CreatedBy: string;
  ValidatedAsync?: boolean;
};

export type PackageVersionListCommandResult = PackageVersionListDetails[];

export class PackageVersionListCommand extends SfCommand<PackageVersionListCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:version:list'];
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
    concise: Flags.boolean({
      summary: messages.getMessage('flags.concise.summary'),
    }),
    'show-conversions-only': Flags.boolean({
      summary: messages.getMessage('flags.show-conversions-only.summary'),
    }),
    'modified-last-days': Flags.integer({
      char: 'm',
      deprecateAliases: true,
      aliases: ['modifiedlastdays'],
      summary: packaging.getMessage('flags.modified-last-days.summary'),
    }),
    packages: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.packages.summary'),
    }),
    released: Flags.boolean({
      char: 'r',
      summary: messages.getMessage('flags.released.summary'),
    }),
    branch: Flags.string({
      char: 'b',
      summary: messages.getMessage('flags.branch.summary'),
    }),
    'order-by': Flags.string({
      // eslint-disable-next-line sf-plugin/dash-o
      char: 'o',
      deprecateAliases: true,
      aliases: ['orderby'],
      summary: messages.getMessage('flags.order-by.summary'),
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  public async run(): Promise<PackageVersionListCommandResult> {
    const { flags } = await this.parse(PackageVersionListCommand);
    const connection = flags['target-dev-hub'].getConnection(flags['api-version']);
    const project = await maybeGetProject();

    const records = await Package.listVersions(connection, project, {
      createdLastDays: flags['created-last-days'],
      concise: flags.concise,
      modifiedLastDays: flags['modified-last-days'],
      packages: flags.packages?.split(',') ?? [],
      isReleased: flags.released,
      orderBy: flags['order-by'],
      verbose: flags.verbose,
      branch: flags.branch,
      showConversionsOnly: flags['show-conversions-only'],
    });

    const results: PackageVersionListCommandResult = [];

    if (records?.length > 0) {
      let ancestorVersionsMap: Map<string, string> | undefined;
      // lookup ancestorVersions if ancestorIds are present
      const ancestorIds = records.filter((record) => record.AncestorId).map((record) => record.AncestorId);
      if (ancestorIds?.length > 0) {
        ancestorVersionsMap = await getPackageVersionStrings(ancestorIds, connection);
      }

      // Get the container options for each package version. We need this for determining if the version is OrgDependent
      const recordIds = [...new Set(records.map((record) => record.Package2Id))];
      const containerOptionsMap = await getContainerOptions(recordIds, connection);

      records.forEach((record) => {
        const ids = [record.Id, record.SubscriberPackageVersionId];
        const aliases = ids.map((id) => (project ? project.getAliasesFromPackageId(id) : id)).flat();
        const AliasStr = project ? (aliases.length > 0 ? aliases.join() : '') : '';

        // Calculate AncestorId value without modifying record
        let computedAncestorId = record.AncestorId;
        let computedAncestorVersion: string | undefined;
        if (record.AncestorId) {
          computedAncestorVersion = ancestorVersionsMap?.get(record.AncestorId);
        } else if (containerOptionsMap.get(record.Package2Id) !== 'Managed') {
          // display N/A if package is unlocked
          computedAncestorVersion = 'N/A';
          computedAncestorId = 'N/A'; // Use computed variable
        }

        function getCodeCoverage(): string {
          if (!flags.verbose) {
            return 'use --verbose for code coverage';
          }

          return record.CodeCoverage?.apexCodeCoveragePercentage != null
            ? `${record.CodeCoverage.apexCodeCoveragePercentage.toString()}%`
            : Boolean(record.Package2.IsOrgDependent) || record.ValidationSkipped
            ? 'N/A'
            : '';
        }

        const hasPassedCodeCoverageCheck =
          record.Package2.IsOrgDependent === true || record.ValidationSkipped
            ? 'N/A'
            : record.HasPassedCodeCoverageCheck;

        const isOrgDependent =
          containerOptionsMap.get(record.Package2Id) === 'Managed'
            ? 'N/A'
            : record.Package2.IsOrgDependent
            ? 'Yes'
            : 'No';

        const hasMetadataRemoved =
          containerOptionsMap.get(record.Package2Id) !== 'Managed' ? 'N/A' : record.HasMetadataRemoved ? 'Yes' : 'No';

        results.push({
          Package2Id: record.Package2Id,
          Branch: record.Branch,
          Tag: record.Tag,
          MajorVersion: record.MajorVersion,
          MinorVersion: record.MinorVersion,
          PatchVersion: record.PatchVersion,
          BuildNumber: record.BuildNumber,
          Id: record.Id,
          SubscriberPackageVersionId: record.SubscriberPackageVersionId,
          ConvertedFromVersionId: record.ConvertedFromVersionId,
          Name: record.Name,
          NamespacePrefix: record.Package2.NamespacePrefix,
          Package2Name: record.Package2.Name,
          Description: record.Description,
          Version: [record.MajorVersion, record.MinorVersion, record.PatchVersion, record.BuildNumber].join('.'),
          // Table output needs string false to display 'false'
          IsPasswordProtected: flags.json ? record.IsPasswordProtected : record.IsPasswordProtected.toString(),
          IsReleased: flags.json ? record.IsReleased : record.IsReleased.toString(),
          CreatedDate: new Date(record.CreatedDate).toISOString().replace('T', ' ').substring(0, 16),
          LastModifiedDate: new Date(record.LastModifiedDate).toISOString().replace('T', ' ').substring(0, 16),
          InstallUrl: INSTALL_URL_BASE.toString() + record.SubscriberPackageVersionId,
          CodeCoverage: getCodeCoverage(),
          HasPassedCodeCoverageCheck: hasPassedCodeCoverageCheck as string | boolean,
          ValidationSkipped: record.ValidationSkipped,
          ValidatedAsync: record.ValidatedAsync,
          AncestorId: computedAncestorId,
          AncestorVersion: computedAncestorVersion as string,
          Alias: AliasStr,
          IsOrgDependent: isOrgDependent,
          ReleaseVersion: record.ReleaseVersion == null ? '' : Number.parseFloat(record.ReleaseVersion).toFixed(1),
          BuildDurationInSeconds: record.BuildDurationInSeconds ?? '',
          HasMetadataRemoved: hasMetadataRemoved,
          CreatedBy: record.CreatedById,
          Language: record.Language,
        });
      });
      this.table({
        title: `Package Versions [${results.length}]`,
        data: results,
        overflow: 'wrap',
        columns: getColumnData(flags.concise, flags.verbose, flags['show-conversions-only']),
      });
    } else {
      this.warn('No results found');
    }

    return results;
  }
}

const getColumnData = (
  concise: boolean,
  verbose: boolean,
  conversions: boolean
): TableOptions<PackageVersionListDetails>['columns'] => {
  if (concise) {
    return [
      { key: 'Package2Id', name: messages.getMessage('package-id') },
      { key: 'Version', name: messages.getMessage('version') },
      { key: 'SubscriberPackageVersionId', name: messages.getMessage('subscriberPackageVersionId') },
      { key: 'IsReleased', name: 'Released' },
    ];
  }
  const defaultCols = [
    { key: 'Package2Name', name: 'Package Name' },
    { key: 'NamespacePrefix', name: 'Namespace' },
    { key: 'Name', name: 'Version Name' },
    { key: 'Version', name: messages.getMessage('version') },
    { key: 'SubscriberPackageVersionId', name: messages.getMessage('subscriberPackageVersionId') },
    { key: 'Alias', name: messages.getMessage('alias') },
    { key: 'IsPasswordProtected', name: messages.getMessage('installKey') },
    { key: 'IsReleased', name: 'Released' },
    { key: 'ValidationSkipped', name: messages.getMessage('validationSkipped') },
    { key: 'ValidatedAsync', name: messages.getMessage('validatedAsync') },
    { key: 'AncestorId', name: 'Ancestor' },
    { key: 'AncestorVersion', name: 'Ancestor Version' },
    { key: 'Branch', name: messages.getMessage('packageBranch') },
  ];

  if (conversions && !verbose) {
    defaultCols.push({ key: 'ConvertedFromVersionId', name: messages.getMessage('convertedFromVersionId') });
  }

  if (!verbose) {
    // @ts-expect-error the default cols don't match 1:1 to the data in the table, but that's on purpose
    return defaultCols;
  } else {
    // add additional columns for verbose output
    // @ts-expect-error the verbose match 1:1 to the data in the table, but that's on purpose, but the OCLIF types can't determine tha
    return defaultCols.concat([
      { key: 'Package2Id', name: messages.getMessage('package-id') },
      { key: 'InstallUrl', name: messages.getMessage('installUrl') },
      { key: 'Id', name: messages.getMessage('id') },
      { key: 'CreatedDate', name: 'Created Date' },
      { key: 'LastModifiedDate', name: 'Last Modified Date' },
      { key: 'Tag', name: messages.getMessage('packageTag') },
      { key: 'Description', name: messages.getMessage('description') },
      { key: 'CodeCoverage', name: messages.getMessage('codeCoverage') },
      { key: 'HasPassedCodeCoverageCheck', name: messages.getMessage('hasPassedCodeCoverageCheck') },
      { key: 'ConvertedFromVersionId', name: messages.getMessage('convertedFromVersionId') },
      { key: 'IsOrgDependent', name: messages.getMessage('isOrgDependent') },
      { key: 'ReleaseVersion', name: messages.getMessage('releaseVersion') },
      { key: 'BuildDurationInSeconds', name: messages.getMessage('buildDurationInSeconds') },
      { key: 'HasMetadataRemoved', name: messages.getMessage('hasMetadataRemoved') },
      { key: 'CreatedBy', name: messages.getMessage('createdBy') },
      { key: 'Language', name: messages.getMessage('language') },
    ]);
  }
};
