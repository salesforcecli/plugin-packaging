/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfProject } from '@salesforce/core';
import { CliUx } from '@oclif/core';
import {
  getContainerOptions,
  getPackageVersionStrings,
  INSTALL_URL_BASE,
  Package,
  PackageVersionListResult,
} from '@salesforce/packaging';
import { Optional } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_list');
const packaging = Messages.loadMessages('@salesforce/plugin-packaging', 'packaging');

export type PackageVersionListCommandResult = Omit<
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
};

export class PackageVersionListCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresDevhubUsername = true;
  public static readonly flagsConfig: FlagsConfig = {
    createdlastdays: flags.number({
      char: 'c',
      description: packaging.getMessage('createdLastDaysDescription'),
      longDescription: packaging.getMessage('createdLastDaysLongDescription'),
    }),
    concise: flags.builtin({
      description: messages.getMessage('conciseDescription'),
      longDescription: messages.getMessage('conciseLongDescription'),
    }),
    modifiedlastdays: flags.number({
      char: 'm',
      description: packaging.getMessage('modifiedLastDaysDescription'),
      longDescription: packaging.getMessage('modifiedLastDaysLongDescription'),
    }),
    packages: flags.array({
      char: 'p',
      description: messages.getMessage('packagesDescription'),
      longDescription: messages.getMessage('packagesLongDescription'),
    }),
    released: flags.boolean({
      char: 'r',
      description: messages.getMessage('releasedDescription'),
      longDescription: messages.getMessage('releasedLongDescription'),
    }),
    orderby: flags.array({
      char: 'o',
      description: messages.getMessage('orderByDescription'),
      longDescription: messages.getMessage('orderByLongDescription'),
    }),
    verbose: flags.builtin({
      description: messages.getMessage('verboseDescription'),
      longDescription: messages.getMessage('verboseLongDescription'),
    }),
  };

  public async run(): Promise<PackageVersionListCommandResult[]> {
    const connection = this.hubOrg.getConnection();
    const project = SfProject.getInstance();

    const records = await Package.listVersions(connection, project, {
      createdLastDays: this.flags.createdlastdays as number,
      concise: this.flags.concise as boolean,
      modifiedLastDays: this.flags.modifiedlastdays as number,
      packages: (this.flags.packages as string[]) ?? [],
      isReleased: this.flags.released as boolean,
      orderBy: this.flags.orderby as string,
      verbose: this.flags.verbose as boolean,
    });

    const results: PackageVersionListCommandResult[] = [];

    if (records?.length > 0) {
      let ancestorVersionsMap: Optional<Map<string, string>>;
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
        const aliases = [];
        ids.forEach((id) => {
          const matches = project.getAliasesFromPackageId(id);
          if (matches.length > 0) {
            aliases.push(matches);
          }
        });
        const AliasStr = aliases.length > 0 ? aliases.join() : '';

        // set Ancestor display values
        let ancestorVersion: Optional<string> = null;
        if (record.AncestorId) {
          ancestorVersion = ancestorVersionsMap.get(record.AncestorId);
        } else if (containerOptionsMap.get(record.Package2Id) !== 'Managed') {
          // display N/A if package is unlocked
          ancestorVersion = 'N/A';
          record.AncestorId = 'N/A';
        }

        const codeCoverage =
          record.CodeCoverage?.apexCodeCoveragePercentage != null
            ? `${record.CodeCoverage.apexCodeCoveragePercentage.toString()}%`
            : record.Package2.IsOrgDependent || record.ValidationSkipped
            ? 'N/A'
            : '';

        const hasPassedCodeCoverageCheck =
          record.Package2.IsOrgDependent === true || record.ValidationSkipped === true
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
          IsPasswordProtected: this.flags.json ? record.IsPasswordProtected : record.IsPasswordProtected.toString(),
          IsReleased: this.flags.json ? record.IsReleased : record.IsReleased.toString(),
          CreatedDate: new Date(record.CreatedDate).toISOString().replace('T', ' ').substring(0, 16),
          LastModifiedDate: new Date(record.LastModifiedDate).toISOString().replace('T', ' ').substring(0, 16),
          InstallUrl: INSTALL_URL_BASE.toString() + record.SubscriberPackageVersionId,
          CodeCoverage: codeCoverage,
          HasPassedCodeCoverageCheck: hasPassedCodeCoverageCheck,
          ValidationSkipped: record.ValidationSkipped,
          AncestorId: record.AncestorId,
          AncestorVersion: ancestorVersion,
          Alias: AliasStr,
          IsOrgDependent: isOrgDependent,
          ReleaseVersion: record.ReleaseVersion == null ? '' : Number.parseFloat(record.ReleaseVersion).toFixed(1),
          BuildDurationInSeconds: record.BuildDurationInSeconds == null ? '' : record.BuildDurationInSeconds,
          HasMetadataRemoved: hasMetadataRemoved,
          CreatedBy: record.CreatedById,
          Language: record.Language,
        });
      });
      this.ux.styledHeader(`Package Versions [${results.length}]`);
      this.ux.table(results, this.getColumnData(), { 'no-truncate': true });
    } else {
      this.ux.log('No results found');
    }

    return results;
  }

  private getColumnData(): CliUx.Table.table.Columns<Record<string, unknown>> {
    if (this.flags.concise) {
      return {
        Package2Id: { header: messages.getMessage('packageId') },
        Version: { header: messages.getMessage('version') },
        SubscriberPackageVersionId: {
          header: messages.getMessage('subscriberPackageVersionId'),
        },
        IsReleased: { header: 'Released' },
      };
    }
    const defaultCols = {
      Package2Name: { header: 'Package Name' },
      NamespacePrefix: { header: 'Namespace' },
      Name: { header: 'Version Name' },
      Version: { header: messages.getMessage('version') },
      SubscriberPackageVersionId: {
        header: messages.getMessage('subscriberPackageVersionId'),
      },
      Alias: { header: messages.getMessage('alias') },
      IsPasswordProtected: { header: messages.getMessage('installKey') },
      IsReleased: { header: 'Released' },
      ValidationSkipped: { header: messages.getMessage('validationSkipped') },
      AncestorId: { header: 'Ancestor' },
      AncestorVersion: { header: 'Ancestor Version' },
      Branch: { header: messages.getMessage('packageBranch') },
    };

    if (!this.flags.verbose) {
      return defaultCols;
    } else {
      // add additional columns for verbose output
      return {
        ...defaultCols,
        Package2Id: { header: messages.getMessage('packageId') },
        InstallUrl: { header: messages.getMessage('installUrl') },
        Id: { header: messages.getMessage('id') },
        CreatedDate: { header: 'Created Date' },
        LastModifiedDate: { header: 'Last Modified Date' },
        Tag: { header: messages.getMessage('packageTag') },
        Description: { header: messages.getMessage('description') },
        CodeCoverage: { header: messages.getMessage('codeCoverage') },
        HasPassedCodeCoverageCheck: {
          header: messages.getMessage('hasPassedCodeCoverageCheck'),
        },
        ConvertedFromVersionId: {
          header: messages.getMessage('convertedFromVersionId'),
        },
        IsOrgDependent: { header: messages.getMessage('isOrgDependent') },
        ReleaseVersion: { header: messages.getMessage('releaseVersion') },
        BuildDurationInSeconds: {
          header: messages.getMessage('buildDurationInSeconds'),
        },
        HasMetadataRemoved: {
          header: messages.getMessage('hasMetadataRemoved'),
        },
        CreatedBy: { header: messages.getMessage('createdBy') },
        Language: { header: messages.getMessage('language') },
      };
    }
  }
}
