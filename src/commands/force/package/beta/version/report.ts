/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { PackageVersion, PackageVersionReportResult, PackagingSObjects } from '@salesforce/packaging';
import * as chalk from 'chalk';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_report');
const pvlMessages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_list');
const plMessages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_list');
export type PackageVersionReportResultModified = Omit<
  PackageVersionReportResult,
  'CodeCoverage' | 'HasPassedCodeCoverageCheck' | 'Package2' | 'HasMetadataRemoved' | 'PackageType'
> & {
  CodeCoverage: string;
  HasPassedCodeCoverageCheck: boolean | string;
  Package2: Partial<Omit<PackagingSObjects.Package2, 'IsOrgDependent'> & { IsOrgDependent: string }>;
  HasMetadataRemoved: boolean | string;
};
export class PackageVersionReportCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
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
    const packageVersion = new PackageVersion({
      connection: this.hubOrg.getConnection(),
      project: this.project,
      idOrAlias: this.flags.package as string,
    });
    const results = await packageVersion.report(this.flags.verbose);
    const massagedResults = this.massageResultsForDisplay(results);
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
        value: record.Description,
      },
      {
        key: pvlMessages.getMessage('packageBranch'),
        value: record.Branch,
      },
      {
        key: pvlMessages.getMessage('packageTag'),
        value: record.Tag,
      },
      { key: messages.getMessage('isReleased'), value: `${record.IsReleased}` },
      {
        key: pvlMessages.getMessage('validationSkipped'),
        value: record.ValidationSkipped,
      },
      { key: messages.getMessage('ancestorId'), value: record.AncestorId },
      { key: messages.getMessage('ancestorVersion'), value: record.AncestorVersion },
      {
        key: pvlMessages.getMessage('codeCoverage'),
        value: record.CodeCoverage,
      },
      {
        key: pvlMessages.getMessage('hasPassedCodeCoverageCheck'),
        value: record.HasPassedCodeCoverageCheck,
      },
      {
        key: pvlMessages.getMessage('convertedFromVersionId'),
        value: record.ConvertedFromVersionId,
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
        value: record.BuildDurationInSeconds === null ? '' : record.BuildDurationInSeconds.toFixed(1),
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
        displayCoverageRecords = coverageData.slice(0, maximumNumClasses).map((coverageDatum) => ({
            key: coverageDatum.className,
            value: `${coverageDatum.codeCoveragePercentage}%`,
          }));
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

  private massageResultsForDisplay(results: PackageVersionReportResult): PackageVersionReportResultModified {
    const record = JSON.parse(JSON.stringify(results)) as PackageVersionReportResultModified;
    record.Version = [record.MajorVersion, record.MinorVersion, record.PatchVersion, record.BuildNumber].join('.');

    if (results.PackageType !== 'Managed') {
      record.AncestorVersion = 'N/A';
      record.AncestorId = 'N/A';
    }

    if (results.Package2.IsOrgDependent === true || results.ValidationSkipped === true) {
      record.CodeCoverage = 'N/A';
    } else {
      record.CodeCoverage = results.CodeCoverage?.apexCodeCoveragePercentage
        ? `${results.CodeCoverage?.apexCodeCoveragePercentage}%`
        : 'N/A';
    }

    record.HasPassedCodeCoverageCheck =
      results.Package2.IsOrgDependent || results.ValidationSkipped ? 'N/A' : results.HasPassedCodeCoverageCheck;

    record.Package2.IsOrgDependent =
      results.PackageType === 'Managed' ? 'N/A' : results.Package2.IsOrgDependent === true ? 'Yes' : 'No';

    // set HasMetadataRemoved to N/A for Unlocked, and No when value is false or absent (pre-230)
    record.HasMetadataRemoved = results.PackageType !== 'Managed' ? 'N/A' : results.HasMetadataRemoved ? 'Yes' : 'No';

    record.ConvertedFromVersionId ??= ' ';

    // for backward compatibility, remove PackageType from the record
    delete record['PackageType'];

    return record;
  }
}
