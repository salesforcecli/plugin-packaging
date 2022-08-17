/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, OrgConfigProperties } from '@salesforce/core';
import { CodeCoverage, PackageVersion, PackageVersionReportResult, PackagingSObjects } from '@salesforce/packaging';
import * as pkgUtils from '@salesforce/packaging';
import * as chalk from 'chalk';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_report');
const pvlMessages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_list');
const plMessages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_list');
type PackageVersionReportResultModified = Omit<
  PackageVersionReportResult,
  'CodeCoverage' | 'HasPassedCodeCoverageCheck' | 'Package2' | 'HasMetadataRemoved'
> & {
  CodeCoverage: CodeCoverage | string;
  HasPassedCodeCoverageCheck: boolean | string;
  Package2: Partial<Omit<PackagingSObjects.Package2, 'IsOrgDependent'> & { IsOrgDependent: boolean | string }>;
  HasMetadataRemoved: boolean | string;
};
export class PackageVersionReportCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly longDescription = messages.getMessage('cliLongDescription');
  public static readonly help = messages.getMessage('help');
  public static readonly orgType = OrgConfigProperties.TARGET_DEV_HUB;
  public static readonly requiresDevhubUsername = true;
  public static readonly requiresProject = true;
  public static readonly flagsConfig: FlagsConfig = {
    package: flags.string({
      char: 'p',
      description: messages.getMessage('package'),
      longDescription: messages.getMessage('packageLong'),
      required: true,
    }),
    verbose: flags.builtin({
      description: messages.getMessage('verboseDescription'),
      longDescription: messages.getMessage('verboseLongDescription'),
    }),
  };
  protected haveCodeCoverageData = false;

  public async run(): Promise<PackageVersionReportResultModified> {
    const packageVersion = new PackageVersion({ connection: this.hubOrg.getConnection(), project: this.project });
    const results = await packageVersion.report(this.flags.package, this.flags.verbose);
    const massagedResults = await this.massageResultsForDisplay(results);
    this.display(massagedResults);
    return massagedResults;
  }

  private display(record: PackageVersionReportResultModified): void {
    if (this.flags.json) {
      return;
    }

    let dependencies: string = null;

    // collect the Dependency 04ts into a comma-separated list for non-json output
    if (this.flags.verbose && record.SubscriberPackageVersion.Dependencies != null) {
      dependencies = record.SubscriberPackageVersion.Dependencies.ids
        .map((d) => d.subscriberPackageVersionId)
        .join(', ');
    }

    // transform the results into a table
    const displayRecords = [
      {
        key: pvlMessages.getMessage('name'),
        value: record.Name,
      },
      {
        key: pvlMessages.getMessage('subscriberPackageVersionId'),
        value: record.SubscriberPackageVersionId,
      },
      { key: 'Id', value: record.Id },
      {
        key: pvlMessages.getMessage('packageId'),
        value: record.Package2Id,
      },
      {
        key: pvlMessages.getMessage('version'),
        value: record.Version,
      },
      {
        key: pvlMessages.getMessage('description'),
        value: record.Description === null ? 'null' : record.Description,
      },
      {
        key: pvlMessages.getMessage('packageBranch'),
        value: record.Branch === null ? 'null' : record.Branch,
      },
      {
        key: pvlMessages.getMessage('packageTag'),
        value: record.Tag === null ? 'null' : record.Tag,
      },
      { key: messages.getMessage('isReleased'), value: record.IsReleased.toString() },
      {
        key: pvlMessages.getMessage('validationSkipped'),
        value: record.ValidationSkipped,
      },
      { key: messages.getMessage('ancestorId'), value: record.AncestorId },
      { key: messages.getMessage('ancestorVersion'), value: record.AncestorVersion },
      {
        key: pvlMessages.getMessage('codeCoverage'),
        value:
          record.CodeCoverage === null
            ? ' '
            : record.CodeCoverage['apexCodeCoveragePercentage'] !== undefined
            ? `${record.CodeCoverage['apexCodeCoveragePercentage'] as number}%`
            : 'N/A', // N/A
      },
      {
        key: pvlMessages.getMessage('hasPassedCodeCoverageCheck'),
        value: record.HasPassedCodeCoverageCheck,
      },
      {
        key: pvlMessages.getMessage('convertedFromVersionId'),
        value: record.ConvertedFromVersionId === null ? ' ' : record.ConvertedFromVersionId,
      },
      {
        key: plMessages.getMessage('isOrgDependent'),
        value: record.Package2.IsOrgDependent,
      },
      {
        key: pvlMessages.getMessage('releaseVersion'),
        value: record.ReleaseVersion === null ? '' : record.ReleaseVersion.toFixed(1),
      },
      {
        key: pvlMessages.getMessage('buildDurationInSeconds'),
        value: record.BuildDurationInSeconds === null ? '' : record.BuildDurationInSeconds,
      },
      {
        key: pvlMessages.getMessage('hasMetadataRemoved'),
        value: record.HasMetadataRemoved,
      },
      {
        key: messages.getMessage('dependencies'),
        value: this.flags.verbose && dependencies != null ? dependencies : ' ',
      },
      {
        key: plMessages.getMessage('createdBy'),
        value: record.CreatedById,
      },
    ];
    const maximumNumClasses = 15; // Number of least code covered classes displayed on the cli output for better UX.
    let codeCovStr = ''; // String to display when code coverage data is empty or null
    let displayCoverageRecords = [];
    // collect the code coverage data into an array of key value records for non-json output
    if (this.flags.verbose) {
      const coverageData = record.CodeCoveragePercentages?.codeCovPercentages;
      if (!coverageData) {
        codeCovStr = 'N/A'; // Code coverage isn't calculated as part of version create command
      } else if (!coverageData.length) {
        // Calculated code coverage data is too big to fit into a DB field. Retrieve it from the packageZip
        codeCovStr =
          'The code coverage details are too large to display. To request code coverage details for this package version, log a case in the Salesforce Partner Community.';
      } else {
        displayCoverageRecords = coverageData.slice(0, maximumNumClasses).map((coverageDatum) => {
          return {
            key: coverageDatum.className,
            value: `${coverageDatum.codeCoveragePercentage}%`,
          };
        });
        this.haveCodeCoverageData = displayCoverageRecords.length > 0;
      }
    }

    // Always append code coverage column label ar the end
    displayRecords.push({
      key: messages.getMessage('codeCoveragePercentages'),
      value: this.haveCodeCoverageData === true ? '...' : codeCovStr,
    });
    if (!this.flags.verbose) {
      displayRecords.splice(displayRecords.map((e) => e.key).indexOf('Id'), 1);
      displayRecords.splice(
        displayRecords.map((e) => e.key).indexOf(pvlMessages.getMessage('convertedFromVersionId')),
        1
      );
      displayRecords.splice(displayRecords.map((e) => e.key).indexOf(messages.getMessage('dependencies')), 1);
      displayRecords.splice(
        displayRecords.map((e) => e.key).indexOf(messages.getMessage('codeCoveragePercentages')),
        1
      );
      displayCoverageRecords.splice(0, displayCoverageRecords.length);
    }
    this.ux.styledHeader(chalk.blue('Package Version'));
    this.ux.table(displayRecords, { key: { header: 'Name' }, value: { header: 'Value' } });
    if (displayCoverageRecords.length > 0) {
      this.ux.table(displayCoverageRecords, { key: { header: 'Class Name' }, value: { header: 'Code Coverage' } });
    }
  }

  private async massageResultsForDisplay(
    results: PackageVersionReportResult
  ): Promise<PackageVersionReportResultModified> {
    const record = results as PackageVersionReportResultModified;
    record.Version = [record.MajorVersion, record.MinorVersion, record.PatchVersion, record.BuildNumber].join('.');

    let ancestorVersion: string = null;
    const containerOptions = await pkgUtils.getContainerOptions([record.Package2Id], this.hubOrg.getConnection());
    const packageType = containerOptions.get(record.Package2Id);
    if (record.AncestorId) {
      // lookup AncestorVersion value
      const ancestorVersionMap = await pkgUtils.getPackageVersionStrings(
        [record.AncestorId],
        this.hubOrg.getConnection()
      );
      ancestorVersion = ancestorVersionMap.get(record.AncestorId);
    } else {
      // otherwise display 'N/A' if package is Unlocked Packages
      if (packageType !== 'Managed') {
        ancestorVersion = 'N/A';
        record.AncestorId = 'N/A';
      }
    }

    record.CodeCoverage =
      record.Package2.IsOrgDependent === true || record.ValidationSkipped === true ? 'N/A' : record.CodeCoverage;

    record.HasPassedCodeCoverageCheck =
      record.Package2.IsOrgDependent === true || record.ValidationSkipped === true
        ? 'N/A'
        : record.HasPassedCodeCoverageCheck;

    record.Package2.IsOrgDependent =
      packageType === 'Managed' ? 'N/A' : record.Package2.IsOrgDependent === true ? 'Yes' : 'No';

    // set HasMetadataRemoved to N/A for Unlocked, and No when value is false or absent (pre-230)
    record.HasMetadataRemoved = packageType !== 'Managed' ? 'N/A' : record.HasMetadataRemoved === true ? 'Yes' : 'No';

    // add AncestorVersion to the json record
    record.AncestorVersion = ancestorVersion;

    return record;
  }
}
