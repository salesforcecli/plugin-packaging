/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, genUniqueString, TestSession } from '@salesforce/cli-plugins-testkit';
import { ConfigAggregator, Org, SfProject } from '@salesforce/core';
import { expect, config as chaiConfig, assert } from 'chai';
import { Duration } from '@salesforce/kit';
import {
  PackageAncestryNodeData,
  PackageSaveResult,
  PackageVersionCreateRequestResult,
  PackagingSObjects,
  VersionNumber,
} from '@salesforce/packaging';
import { isNamedPackagingDirectory, isPackagingDirectory } from '@salesforce/core/project';
import {
  PackageVersionListCommandResult,
  PackageVersionListDetails,
} from '../../../src/commands/package/version/list.js';
import { CreateListCommandResult } from '../../../src/commands/package/version/create/list.js';

chaiConfig.truncateThreshold = 0;

const expectedPVCRkeys = [
  'Id',
  'Status',
  'Package2Id',
  'Package2Name',
  'Package2VersionId',
  'SubscriberPackageVersionId',
  'Tag',
  'Branch',
  'Error',
  'CreatedDate',
  'HasMetadataRemoved',
  'HasPassedCodeCoverageCheck',
  'CreatedBy',
  'ConvertedFromVersionId',
  'CodeCoverage',
  'VersionNumber',
  'TotalNumberOfMetadataFiles',
  'TotalSizeOfMetadataFiles',
];

// Keys expected for Package version create list.
// TotalNumberOfMetadataFiles is not included.
const expectedPVCLkeys = [
  'Id',
  'Status',
  'Package2Id',
  'Package2Name',
  'Package2VersionId',
  'SubscriberPackageVersionId',
  'Tag',
  'Branch',
  'Error',
  'CreatedDate',
  'HasMetadataRemoved',
  'HasPassedCodeCoverageCheck',
  'CreatedBy',
  'ConvertedFromVersionId',
  'CodeCoverage',
  'VersionNumber',
];

describe('package:version:*', () => {
  let session: TestSession;
  let packageId: string | undefined;
  let packageVersionId: string | undefined;
  const packageVersionIds: string[] = []; // ['04t', '04t'];
  const pkgName = genUniqueString('dancingbears-');

  before(async () => {
    session = await TestSession.create({
      devhubAuthStrategy: 'AUTO',
      project: { gitClone: 'https://github.com/trailheadapps/dreamhouse-lwc' },
    });

    packageId = execCmd<{ Id: string }>(
      `package:create -n ${pkgName} -v ${session.hubOrg.username} --json -t Unlocked -r ./force-app`,
      {
        ensureExitCode: 0,
      }
    ).jsonOutput?.result?.Id;
  });

  after(async () => {
    await session?.clean();
  });

  describe('package:version:create', () => {
    it('should create a new package version (human)', () => {
      const result = execCmd(
        `package:version:create --package ${pkgName} -x --code-coverage --version-description "Initial version" --branch testing`,
        { ensureExitCode: 0 }
      ).shellOutput.stdout;
      expect(result).to.include("Package version creation request status is '");
      expect(result).to.match(/Run "sfd?x? package version create report -i 08c.{15}" to query for status\./);
    });

    it('should create a new package version with async-validation', () => {
      const result = execCmd(
        `package:version:create --package ${pkgName} -x --async-validation --version-description "Initial version"`,
        { ensureExitCode: 0 }
      ).shellOutput.stdout;
      // eslint-disable-next-line no-console
      console.log(result);
      expect(result).to.include("Package version creation request status is '");
      expect(result).to.match(/Run "sfd?x? package version create report -i 08c.{15}" to query for status\./);
    });

    // package:version:create --wait --json is tested in versionPromoteUpdate.nut.ts
    it('should create a new package version and wait (human)', () => {
      const result = execCmd(
        `package:version:create --package ${pkgName} --wait 20 -x --code-coverage --version-description "Initial version" --version-number 1.0.0.NEXT`,
        { ensureExitCode: 0, timeout: Duration.minutes(20).milliseconds }
      ).shellOutput.stdout;
      expect(result).to.match(/Successfully created the package version \[08c.{15}]/);
      expect(result).to.match(/Subscriber Package Version Id: 04t.{15}/);
      expect(result).to.match(
        /Package Installation URL: https:\/\/login.salesforce.com\/packaging\/installPackage\.apexp\?p0=04t.{15}/
      );
      expect(result).to.match(/As an alternative, you can use the "sfd?x? package install" command\./);
    });

    it('should create a new package version (json)', () => {
      const result = execCmd<PackageVersionCreateRequestResult>(
        `package:version:create --package ${pkgName} --json --tag tag --branch branch -x --code-coverage --version-description "Initial version"`,
        { ensureExitCode: 0 }
      ).jsonOutput?.result;
      expect(result).to.have.all.keys(expectedPVCRkeys);
      packageVersionId = result?.Id;
      expect(result?.Id).to.match(/08c.{15}/);
      expect(result?.Package2Id).to.match(/0Ho.{15}/);
      expect(result?.Branch).to.equal('branch');
      expect(result?.Tag).to.equal('tag');
      expect(result?.Error).to.deep.equal([]);
      expect([
        'Succeeded',
        'Initializing',
        'InProgress',
        'Queued',
        'VerifyingMetadata',
        'VerifyingFeaturesAndSettings',
        'VerifyingDependencies',
        'FinalizingPackageVersion',
      ]).to.include(result?.Status);
    });

    it('should create a new package version with a packageID in packageDirectories package property', async () => {
      // Modify sfdx-project.json, packageDirectories to have a packageID as the value of the package property.
      const project = await SfProject.resolve();
      const projectJson = project.getSfProjectJson();
      const contents = projectJson.getContents();
      if (!contents.packageDirectories.some((pkgDir) => isPackagingDirectory(pkgDir) && pkgDir.package === pkgName)) {
        expect.fail('packageDirectory not found');
      }
      const newPackageDirs = contents.packageDirectories
        .filter(isPackagingDirectory)
        .map((pkgDir) => (pkgDir.package === pkgName ? { ...pkgDir, package: packageId } : pkgDir));

      projectJson.set('packageDirectories', newPackageDirs);
      projectJson.writeSync();
      execCmd(`package:version:create --package ${packageId} -x --json`, { ensureExitCode: 0 });
    });
  });

  describe('package:version:create:report', () => {
    it('reports on status (json)', () => {
      const result = execCmd<PackageVersionCreateRequestResult[]>(
        `package:version:create:report -i ${packageVersionId} --json`,
        {
          ensureExitCode: 0,
        }
      ).jsonOutput?.result[0];
      expect(result?.Id).to.match(/08c.{15}/);
      expect(result?.Package2Id).to.match(/0Ho.{15}/);
      expect(result?.Branch).to.equal('branch');
      expect(result?.Tag).to.equal('tag');
      expect(result?.Error).to.deep.equal([]);
      expect([
        'Success',
        'Initializing',
        'InProgress',
        'Queued',
        'VerifyingMetadata',
        'VerifyingFeaturesAndSettings',
        'VerifyingDependencies',
        'FinalizingPackageVersion',
      ]).to.include(result?.Status);
    });

    it('reports on status (human)', () => {
      const resultHuman = execCmd<PackageVersionCreateRequestResult[]>(
        `package:version:create:report -i ${packageVersionId}`,
        {
          ensureExitCode: 0,
        }
      ).shellOutput.stdout;
      expect(resultHuman).to.include('Package Version Create Request');
      expect(resultHuman).to.include('Name');
      expect(resultHuman).to.include('Value');
      expect(resultHuman).to.include('ID');
      expect(resultHuman).to.include('Status');
      expect(resultHuman).to.include('Package Id');
      expect(resultHuman).to.include('Subscriber Package Version Id');
      expect(resultHuman).to.include('Tag');
      expect(resultHuman).to.include('Branch');
      expect(resultHuman).to.include('Created By');
    });
  });

  describe('package:version:create:list', () => {
    it('should list the package versions created (human)', async () => {
      const command = `package:version:create:list -v ${session.hubOrg.username}`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('Package Version Create Requests  [');
      expect(output).to.match(
        / Id\s+?|Status\s+?|Package Id\s+?|Package Version Id\s+?|Subscriber Package Version Id\s+?|Tag\s+?|Branch\s+?|Created Date\s+?|Created By\s+?|/
      );
    });

    it('should list all of the successful package versions created', async () => {
      const command = `package:version:create:list --status Success -v ${session.hubOrg.username} --json`;
      const output = execCmd<CreateListCommandResult>(command, { ensureExitCode: 0 }).jsonOutput;
      output?.result?.forEach((result) => {
        expect(result?.Status).to.equal('Success');
      });
    });

    it('should list all of the package versions created within the last 2 days', () => {
      const command = `package:version:create:list --created-last-days 2 -v ${session.hubOrg.username} --json`;
      const output = execCmd<CreateListCommandResult>(command, { ensureExitCode: 0 }).jsonOutput;
      expect(output).to.be.ok;
      expect(output?.status).to.equal(0);
      expect(output?.result).to.have.length.greaterThan(0);
      expect(output?.result[0]).to.have.keys(expectedPVCLkeys);
      const current = Date.now();
      // @ts-ignore
      const created = Date.parse(output?.result?.at(0).CreatedDate);
      // eslint-disable-next-line no-console
      console.log(`CreatedDate: ${output?.result[0].CreatedDate} current: ${current}, created: ${created}`);
      const some2DaysAgo = current - Duration.days(2.5).milliseconds;
      // some2DaysAgo <= created && created <= current
      // eslint-disable-next-line no-console
      console.log(`some2DaysAgo: ${some2DaysAgo}`);
      expect(some2DaysAgo <= created && created <= current).to.be.true;
    });

    it('should list the package versions created (json)', async () => {
      const command = `package:version:create:list -v ${session.hubOrg.username} --json`;
      const output = execCmd<CreateListCommandResult>(command, { ensureExitCode: 0 }).jsonOutput;
      expect(output).to.be.ok;
      expect(output?.status).to.equal(0);
      expect(output?.result).to.have.length.greaterThan(0);
      expect(output?.result[0]).to.have.keys(expectedPVCLkeys);
    });

    it('should list the package versions created as part of package conversion from 1GP --show-conversions-only flag (human)', async () => {
      const command = `package:version:create:list -v ${session.hubOrg.username} --show-conversions-only`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('Package Version Create Requests  [');
      expect(output).to.match(
        / Id\s+?|Status\s+?|Package Id\s+?|Package Version Id\s+?|Subscriber Package Version Id\s+?|Tag\s+?|Branch\s+?|Created Date\s+?|Created By\s+?|Converted From Version Id\s+?|/
      );
    });
    it('should list the package versions created --verbose (json)', async () => {
      const command = `package:version:create:list --status Success --created-last-days 10 -v ${session.hubOrg.username} --json --verbose`;
      const output = execCmd<CreateListCommandResult>(command, { ensureExitCode: 0 }).jsonOutput;
      const expectedVerboseKeys = [...expectedPVCLkeys, 'VersionName'];
      expect(output).to.be.ok;
      expect(output?.status).to.equal(0);
      expect(output?.result).to.have.length.greaterThan(0);
      expect(output?.result[0]).to.have.keys(expectedVerboseKeys);
    });
  });

  describe('package:version:list', () => {
    it('should list package versions in dev hub - human readable results', () => {
      const command = `package:version:list -v ${session.hubOrg.username}`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('Package Versions [');
      expect(output).to.match(
        /Package Name\s+?|Namespace\s+?|Version Name\s+?|Version\s+?|Subscriber Package Version Id\sAlias\s+?|Installation Key\s+?|Released\s+?|Validation Skipped\s+?|Validated Async\s+?|Ancestor\s+?|Ancestor Version\s+?|Branch/
      );
    });

    it('should list package versions in dev hub - concise output', () => {
      const command = `package:version:list -v ${session.hubOrg.username} --concise`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('Package Versions [');
      expect(output).to.match(/Package Id\s+?|Version\s+?|Subscriber Package Version Id\s+?|Released/);
    });

    it('should list package versions modified in the last 5 days', () => {
      const command = `package:version:list -v ${session.hubOrg.username} --modified-last-days 5`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('Package Versions [');
      expect(output).to.match(
        /Package Name\s+?|Namespace\s+?|Version Name\s+?|Version\s+?|Subscriber Package Version Id\sAlias\s+?|Installation Key\s+?|Released\s+?|Validation Skipped\s+?|Validated Async\s+?|Ancestor\s+?|Ancestor Version\s+?|Branch/
      );
    });
    it('should list package versions created in the last 5 days', () => {
      const command = `package:version:list -v ${session.hubOrg.username} --createdlastdays 5`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('Package Versions [');
      expect(output).to.match(
        /Package Name\s+?|Namespace\s+?|Version Name\s+?|Version\s+?|Subscriber Package Version Id\sAlias\s+?|Installation Key\s+?|Released\s+?|Validation Skipped\s+?|Validated Async\s+?|Ancestor\s+?|Ancestor Version\s+?|Branch/
      );
    });
    it('should list installed packages in dev hub - verbose human readable results', () => {
      const command = `package:version:list -v ${session.hubOrg.username} --verbose`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('Package Versions [');
      expect(output).to.match(
        /Package Name\s+?|Namespace\s+?|Version Name\s+?|Version\s+?|Subscriber Package Version Id\sAlias\s+?|Installation Key\s+?|Released\s+?|Validation Skipped\s+?|Validated Async\s+?|Ancestor\s+?|Ancestor Version\s+?|Branch\s+?|Package Id\s+?|Installation URL\s+?|Package Version Id\s+?|Created Date\s+?|Last Modified Date\s+?|Tag\s+?|Description\s+?|Code Coverage\s+?|Code Coverage Met\s+?|Converted From Version Id\s+?|Org-Dependent\s+?|Unlocked Package\s+?|Release\s+?|Version\s+?|Build Duration in Seconds\s+?|Managed Metadata Removed\s+?|Created By/
      );
    });

    it("should list installed packages in dev hub - verbose human readable results only on the 'testing' branch", () => {
      const command = `package:version:list -v ${session.hubOrg.username} --verbose --branch testing`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('Package Versions [');
      expect(output).to.match(
        /Package Name\s+?|Namespace\s+?|Version Name\s+?|Version\s+?|Subscriber Package Version Id\sAlias\s+?|Installation Key\s+?|Released\s+?|Validation Skipped\s+?|Validated Async\s+?|Ancestor\s+?|Ancestor Version\s+?|Branch\s+?|Package Id\s+?|Installation URL\s+?|Package Version Id\s+?|Created Date\s+?|Last Modified Date\s+?|Tag\s+?|Description\s+?|Code Coverage\s+?|Code Coverage Met\s+?|Converted From Version Id\s+?|Org-Dependent\s+?|Unlocked Package\s+?|Release\s+?|Version\s+?|Build Duration in Seconds\s+?|Managed Metadata Removed\s+?|Created By/
      );
      expect(output).to.include('testing');
    });
    it('should list package versions in dev hub - json results', () => {
      const command = `package:version:list -v ${session.hubOrg.username} --json`;
      const output = execCmd<PackageVersionListCommandResult>(command, { ensureExitCode: 0 }).jsonOutput?.result;
      const keys = [
        'Package2Id',
        'Branch',
        'Tag',
        'MajorVersion',
        'MinorVersion',
        'PatchVersion',
        'BuildNumber',
        'Id',
        'SubscriberPackageVersionId',
        'Name',
        'NamespacePrefix',
        'Package2Name',
        'Description',
        'Version',
        'IsPasswordProtected',
        'IsReleased',
        'CreatedDate',
        'LastModifiedDate',
        'InstallUrl',
        'CodeCoverage',
        'ValidationSkipped',
        'ValidatedAsync',
        'AncestorId',
        'AncestorVersion',
        'Alias',
        'IsOrgDependent',
        'ReleaseVersion',
        'BuildDurationInSeconds',
        'HasMetadataRemoved',
        'CreatedBy',
        'ConvertedFromVersionId',
      ];
      expect(output).to.have.length.greaterThan(0);
      expect(output?.at(0)).to.have.keys(keys);
      const codeCoverage = output?.[0]?.CodeCoverage;
      expect(codeCoverage).to.equal('use --verbose for code coverage');
    });

    it('should list package versions in dev hub - verbose json results', () => {
      const command = `package:version:list --verbose -v ${session.hubOrg.username} --json`;
      const output = execCmd<PackageVersionListCommandResult>(command, { ensureExitCode: 0 }).jsonOutput
        ?.result as PackageVersionListCommandResult;
      const keys = [
        'Package2Id',
        'Branch',
        'Tag',
        'MajorVersion',
        'MinorVersion',
        'PatchVersion',
        'BuildNumber',
        'Id',
        'SubscriberPackageVersionId',
        'ConvertedFromVersionId',
        'Name',
        'NamespacePrefix',
        'Package2Name',
        'Description',
        'Version',
        'IsPasswordProtected',
        'IsReleased',
        'CreatedDate',
        'Language',
        'LastModifiedDate',
        'InstallUrl',
        'CodeCoverage',
        'HasPassedCodeCoverageCheck',
        'ValidationSkipped',
        'ValidatedAsync',
        'AncestorId',
        'AncestorVersion',
        'Alias',
        'IsOrgDependent',
        'ReleaseVersion',
        'BuildDurationInSeconds',
        'HasMetadataRemoved',
        'CreatedBy',
      ];

      expect(output).to.have.length.greaterThan(0);
      expect(output[0]).to.have.keys(keys);
      (output as PackageVersionListDetails[])
        .filter((f: { CodeCoverage: string | boolean }) => f.CodeCoverage)
        .map((v: { SubscriberPackageVersionId: string }) => packageVersionIds.push(v.SubscriberPackageVersionId));
    });

    it.skip('should list package versions in dev hub created as part of package conversion from 1GP --show-conversions-only flag (human)', () => {
      const command = `package:version:list -v ${session.hubOrg.username} --show-conversions-only`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('Package Versions [');
      expect(output).to.match(
        /Package Name\s+?|Namespace\s+?|Version Name\s+?|Version\s+?|Subscriber Package Version Id\sAlias\s+?|Installation Key\s+?|Released\s+?|Validation Skipped\s+?|Validated Async\s+?|Ancestor\s+?|Ancestor Version\s+?|Branch\s+?|Converted From Version Id/
      );
    });
  });

  describe('package:version:delete', () => {
    const deletableVersionIds: string[] = [];

    before(() => {
      // query for deletable package versions (released package versions can't be deleted)
      const command = `package:version:list -v ${session.hubOrg.username} -p ${packageId} --json`;
      const output = execCmd<PackageVersionListCommandResult>(command, { ensureExitCode: 0 }).jsonOutput?.result;
      (output as PackageVersionListDetails[])?.forEach(
        (pkgVersion: { SubscriberPackageVersionId: string; IsReleased: string | boolean }) => {
          if (!pkgVersion.IsReleased) {
            deletableVersionIds.push(pkgVersion.SubscriberPackageVersionId);
          }
        }
      );
      expect(
        deletableVersionIds.length,
        'Not enough deletable package versions to run the delete tests'
      ).to.be.greaterThanOrEqual(2);
    });

    it('will delete a package (json)', () => {
      const id = deletableVersionIds.pop();
      expect(id).to.be.a('string').with.length.greaterThanOrEqual(15);
      const command = `package:version:delete -p ${id} --json`;
      const result = execCmd<[PackageSaveResult]>(command, { ensureExitCode: 0 }).jsonOutput?.result;
      expect(result).to.have.property('success', true);
      expect(result).to.have.property('id', id);
      expect(result).to.have.property('errors');
      const listCommand = `package:version:list -v ${session.hubOrg.username} -p ${packageId} --json`;
      const output = execCmd<PackageVersionListCommandResult>(listCommand, { ensureExitCode: 0 }).jsonOutput?.result;
      expect(output?.some((pv) => pv.SubscriberPackageVersionId === id)).to.be.false;
    });

    it('will delete a package (human)', () => {
      const id = deletableVersionIds.pop();
      const command = `package:version:delete -p ${id} --noprompt`;
      const result = execCmd<[PackageSaveResult]>(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(result).to.contain(`Successfully deleted the package version with ID: ${id}`);
    });
  });

  describe('package:version:displaydependencies', () => {
    type PackageVersionCreateRequestResult = {
      Id: string;
      Package2Version: {
        SubscriberPackageVersionId: string;
      };
    };
    let devHubOrg: Org;
    let configAggregator: ConfigAggregator;
    let testPackageRequestId: string; // 08c ID
    let testSubscriberPackageVersionId: string; // 04t ID

    before('dependencies project setup', async () => {
      const query = 'SELECT Id, Package2Version.SubscriberPackageVersionId FROM Package2VersionCreateRequest LIMIT 10';
      configAggregator = await ConfigAggregator.create();
      devHubOrg = await Org.create({ aliasOrUsername: configAggregator.getPropertyValue<string>('target-dev-hub') });
      const pvRecords = (await devHubOrg.getConnection().tooling.query<PackageVersionCreateRequestResult>(query))
        .records;

      if (!pvRecords || pvRecords.length === 0) {
        throw new Error('No package version create requests found with dependency graph json');
      }
      const pv = pvRecords[0];
      testPackageRequestId = pv.Id;
      testSubscriberPackageVersionId = pv.Package2Version.SubscriberPackageVersionId;
    });
    it('should print the correct DOT code output (default)', () => {
      const command = `package:version:displaydependencies -p ${testPackageRequestId}`;
      const result = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(result).to.contain('strict digraph G {');
      const hasValidNode = result.includes('node_');
      expect(hasValidNode).to.be.true;
      expect(result).to.match(/label="[^"]*@\d\.\d\.\d\.\d"/);
      const hasMultipleNodes = result.split('\n').filter((line) => line.includes('node_')).length > 1;
      if (hasMultipleNodes) {
        expect(result).to.contain('->');
      }
    });
    it('should print the correct DOT code output  (verbose)', () => {
      const command = `package:version:displaydependencies -p ${testPackageRequestId} --verbose`;
      const result = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(result).to.contain('strict digraph G {');
      const hasSubscriberPackageVersionId = /\(04t.{15}\)/.test(result);
      const hasVersionBeingBuilt = result.includes('(VERSION_BEING_BUILT)');
      expect(hasSubscriberPackageVersionId || hasVersionBeingBuilt).to.be.true;
    });
    it('should print the correct DOT code output (json)', () => {
      const command = `package:version:displaydependencies -p ${testPackageRequestId} --json`;
      const result = execCmd<string>(command, { ensureExitCode: 0 });
      const dotCode = result.jsonOutput?.result;
      expect(dotCode).to.be.a('string');
      expect(dotCode).to.contain('strict digraph G {');
    });
    it('should print the correct DOT code output  (root-last)', () => {
      const commandRootFirst = `package:version:displaydependencies -p ${testPackageRequestId} --edge-direction root-first`;
      const resultRootFirst = execCmd(commandRootFirst, { ensureExitCode: 0 }).shellOutput.stdout;
      const commandRootLast = `package:version:displaydependencies -p ${testPackageRequestId} --edge-direction root-last`;
      const resultRootLast = execCmd(commandRootLast, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(resultRootFirst).to.contain('strict digraph G {');
      expect(resultRootLast).to.contain('strict digraph G {');
      const hasMultipleNodes = ((resultRootFirst.match(/node_/g) && resultRootLast.match(/node_/g)) || []).length > 1;
      if (hasMultipleNodes) {
        const edgeLinesFirst = resultRootFirst.match(/\t node_\w+ -> node_\w+/g) || [];
        const edgeLinesLast = resultRootLast.match(/\t node_\w+ -> node_\w+/g) || [];
        expect(edgeLinesFirst.length).to.equal(edgeLinesLast.length);
        expect(resultRootFirst).to.not.equal(resultRootLast);
      } else {
        expect(resultRootFirst).to.contain('node_');
        expect(resultRootLast).to.contain('node_');
      }
    });
    it('should work with 04t package version ID if available', function () {
      if (!testSubscriberPackageVersionId) {
        this.skip();
      }
      const command = `package:version:displaydependencies -p ${testSubscriberPackageVersionId}`;
      const result = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(result).to.contain('strict digraph G {');
      const hasValidNode = result.includes('node_');
      expect(hasValidNode).to.be.true;
      expect(result).to.match(/label="[^"]*@\d\.\d\.\d\.\d"/);
      const hasMultipleNodes = result.split('\n').filter((line) => line.includes('node_')).length > 1;
      if (hasMultipleNodes) {
        expect(result).to.contain('->');
      }
    });
  });

  describe('package:version:ancestrydisplay', () => {
    type PackageVersionQueryResult = PackagingSObjects.Package2Version & {
      Package2: {
        Id: string;
        Name: string;
        NamespacePrefix: string;
      };
    };
    let project: SfProject;
    let devHubOrg: Org;
    let configAggregator: ConfigAggregator;
    let ancestryPkgName: string;
    let versions: VersionNumber[];
    let sortedVersions: VersionNumber[];
    let aliases: { [alias: string]: string };

    before('ancestry project setup', async () => {
      const query =
        "SELECT AncestorId, SubscriberPackageVersionId, MajorVersion, MinorVersion, PatchVersion, BuildNumber, Package2Id, Package2.Name, package2.NamespacePrefix FROM Package2Version where package2.containeroptions = 'Managed' AND IsReleased = true";

      configAggregator = await ConfigAggregator.create();
      devHubOrg = await Org.create({ aliasOrUsername: configAggregator.getPropertyValue<string>('target-dev-hub') });
      let pvRecords = (await devHubOrg.getConnection().tooling.query<PackageVersionQueryResult>(query)).records;
      // preferred well known package pnhcoverage3, but if it's not available, use the first one
      if (pvRecords.some((pv) => pv.Package2.Name === 'pnhcoverage3')) {
        ancestryPkgName = 'pnhcoverage3';
      } else {
        ancestryPkgName = pvRecords[0].Package2.Name;
      }
      pvRecords = pvRecords.filter((pv) => pv.Package2.Name === ancestryPkgName);
      versions = pvRecords.map(
        (pv) => new VersionNumber(pv.MajorVersion, pv.MinorVersion, pv.PatchVersion, pv.BuildNumber)
      );
      sortedVersions = [...versions].sort((a, b) => a.compareTo(b));
      project = await SfProject.resolve();
      const pjson = project.getSfProjectJson();
      const pkg = project.getDefaultPackage();
      assert(isNamedPackagingDirectory(pkg));
      pkg.package = ancestryPkgName;
      pkg.versionNumber = sortedVersions[0].toString();
      pkg.versionName = 'v1';
      pjson.set('packageDirectories', [pkg]);

      aliases = Object.fromEntries([
        ...pvRecords.map((pv: PackageVersionQueryResult, index) => [
          `${pv.Package2.Name}@${versions[index].toString()}`,
          pv.SubscriberPackageVersionId,
        ]),
        [ancestryPkgName, pvRecords[0].Package2Id],
      ]) as { [alias: string]: string };
      pjson.set('packageAliases', aliases);
      pjson.set('namespace', pvRecords[0].Package2.NamespacePrefix);
      pjson.writeSync();
    });

    after(async () => {
      await session?.zip();
      await session?.clean();
    });
    it('should have a correct project config', async () => {
      expect(project.getSfProjectJson().get('packageAliases')).to.have.property(ancestryPkgName);
    });
    it('will print the correct output (default)', () => {
      const command = `package:version:displayancestry -p ${ancestryPkgName}`;
      const result = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      // eslint-disable-next-line no-console
      console.log(result);
      expect(result).to.match(new RegExp(`^└─ ${sortedVersions[0].toString()}`));
    });
    it('will print the correct output (verbose)', () => {
      const command = `package:version:displayancestry -p ${ancestryPkgName} --verbose`;
      const result = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      // eslint-disable-next-line no-console
      console.log(result);
      expect(result).to.match(new RegExp(`^└─ ${sortedVersions[0].toString()}`));
      expect(result).to.match(/\d\.\d\.\d\.\d \(04t.{15}\)/);
    });
    it('will print the correct output (dotcode)', () => {
      const command = `package:version:displayancestry -p ${ancestryPkgName} --dot-code`;
      const result = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      // eslint-disable-next-line no-console
      console.log(result);
      expect(result).to.contain('strict graph G {');
      expect(result).to.match(/node04t.{15} \[label="\d\.\d\.\d\.\d"]/);
      expect(result).to.match(/-- node04t.{15}/);
    });
    it('will print the correct output (json)', () => {
      const command = `package:version:displayancestry -p ${ancestryPkgName} --json`;
      const result = execCmd<PackageAncestryNodeData>(command, { ensureExitCode: 0 }).jsonOutput?.result;
      // eslint-disable-next-line no-console
      console.log(result);
      expect(result).to.have.all.keys('data', 'children');
      expect(result?.data).to.have.all.keys(
        'SubscriberPackageVersionId',
        'MajorVersion',
        'MinorVersion',
        'PatchVersion',
        'BuildNumber',
        'depthCounter'
      );
      expect(result?.data.SubscriberPackageVersionId).to.match(/04t.{15}/);
      expect(result?.children).to.be.an('array');
      expect(result?.children[0]).to.have.all.keys('data', 'children');
    });

    it('will print the correct output (json & dotcode)', () => {
      const command = `force:package:version:displayancestry -p ${ancestryPkgName} --dot-code --json`;
      const result = execCmd<PackageAncestryNodeData>(command, { ensureExitCode: 0 }).jsonOutput?.result;
      // eslint-disable-next-line no-console
      console.log(result);
      expect(result).to.contain('strict graph G {');
      expect(result).to.match(/node04t.{15} \[label="\d\.\d\.\d\.\d"]/);
      expect(result).to.match(/-- node04t.{15}/);
    });
  });
});
