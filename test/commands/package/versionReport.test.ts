/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { resolve } from 'path';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { PackageVersion, PackageVersionReportResult } from '@salesforce/packaging';
import * as sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { SfProject } from '@salesforce/core';
import {
  PackageVersionReportCommand,
  PackageVersionReportResultModified,
} from '../../../src/commands/package/version/report';

const pkgVersionReportResultModified: PackageVersionReportResultModified = {
  AncestorId: 'N/A',
  AncestorVersion: 'N/A',
  Branch: '',
  BuildDurationInSeconds: 10,
  BuildNumber: 0,
  CodeCoverage: 'N/A',
  CodeCoveragePercentages: {
    codeCovPercentages: [
      {
        className: '',
        codeCoveragePercentage: 42,
      },
    ],
  },
  ConvertedFromVersionId: '',
  CreatedById: '',
  CreatedDate: 0,
  Description: '',
  HasMetadataRemoved: 'N/A',
  HasPassedCodeCoverageCheck: false,
  Id: '05i3i000000Gmj6XXX',
  InstallKey: '',
  IsDeleted: false,
  IsDeprecated: false,
  IsPasswordProtected: false,
  IsReleased: false,
  LastModifiedById: '',
  LastModifiedDate: 0,
  MajorVersion: 0,
  MinorVersion: 0,
  Name: '',
  Package2: {
    IsOrgDependent: 'No',
  },
  Package2Id: '',
  PatchVersion: 0,
  ReleaseVersion: 0,
  SubscriberPackageVersionId: '',
  SystemModstamp: 0,
  Tag: '',
  ValidationSkipped: false,
  Version: '0.0.0.0',
};

const pkgVersionReportResult: PackageVersionReportResult = {
  PackageType: 'Unlocked',
  AncestorId: 'N/A',
  AncestorVersion: 'N/A',
  Branch: '',
  BuildDurationInSeconds: 10,
  BuildNumber: 0,
  CodeCoverage: null,
  CodeCoveragePercentages: {
    codeCovPercentages: [
      {
        className: '',
        codeCoveragePercentage: 42,
      },
    ],
  },
  ConvertedFromVersionId: '',
  CreatedById: '',
  CreatedDate: 0,
  Description: '',
  HasMetadataRemoved: false,
  HasPassedCodeCoverageCheck: false,
  Id: '05i3i000000Gmj6XXX',
  InstallKey: '',
  IsDeleted: false,
  IsDeprecated: false,
  IsPasswordProtected: false,
  IsReleased: false,
  LastModifiedById: '',
  LastModifiedDate: 0,
  MajorVersion: 0,
  MinorVersion: 0,
  Name: '',
  Package2: {
    IsOrgDependent: false,
  },
  Package2Id: '',
  PatchVersion: 0,
  ReleaseVersion: 0,
  SubscriberPackageVersionId: '',
  SystemModstamp: 0,
  Tag: '',
  ValidationSkipped: false,
  Version: '0.0.0.0',
};

describe('package:version:report - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: resolve(__dirname, '../../package.json') });

  const sandbox = sinon.createSandbox();

  // stubs
  let uxLogStub: sinon.SinonStub;
  let uxTableStub: sinon.SinonStub;
  let uxStyledHeaderStub: sinon.SinonStub;

  beforeEach(async () => {
    uxLogStub = sandbox.stub(SfCommand.prototype, 'log');
    uxTableStub = sandbox.stub(SfCommand.prototype, 'table');
    uxStyledHeaderStub = sandbox.stub(SfCommand.prototype, 'styledHeader');
  });

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  afterEach(() => {
    $$.restore();
    sandbox.restore();
  });

  describe('package:version:report', () => {
    it('should produce package version report', async () => {
      const reportResult = Object.assign({}, pkgVersionReportResult);
      $$.SANDBOX.stub(PackageVersion.prototype, 'report').resolves(reportResult);
      const command = new PackageVersionReportCommand(['-p', '05i3i000000Gmj6XXX', '-v', 'test@hub.org'], config);
      command.project = SfProject.getInstance();

      const result = await command.run();
      expect(result).to.deep.equal(pkgVersionReportResultModified);
      expect(uxLogStub.calledOnce).to.be.false;
      expect(uxTableStub.calledOnce).to.be.true;
      expect(uxStyledHeaderStub.calledOnce).to.be.true;
      expect(uxStyledHeaderStub.args[0][0]).to.include('Package Version');
    });
    it('should produce package version report - json result', async () => {
      const reportResult = Object.assign({}, pkgVersionReportResult);
      $$.SANDBOX.stub(PackageVersion.prototype, 'report').resolves(reportResult);
      const command = new PackageVersionReportCommand(
        ['-p', '05i3i000000Gmj6XXX', '-v', 'test@hub.org', '--json'],
        config
      );
      command.project = SfProject.getInstance();
      const result = await command.run();
      expect(result).to.deep.equal(pkgVersionReportResultModified);
      expect(uxLogStub.calledOnce).to.be.false;
      expect(uxTableStub.calledOnce).to.be.false;
      expect(uxStyledHeaderStub.calledOnce).to.be.false;
    });
  });
  describe('massage results', () => {
    let cmd: PackageVersionReportCommand;
    beforeEach(() => {
      cmd = new PackageVersionReportCommand(['-p', '05i3i000000Gmj6XXX', '-v', 'test@hub.org'], config);
    });

    it('should massage results', () => {
      const result = cmd['massageResultsForDisplay'](pkgVersionReportResult);
      expect(result).to.deep.equal(pkgVersionReportResultModified);
    });
    it('should massage results - general transform', () => {
      const pvrr = Object.assign({}, pkgVersionReportResult);
      pvrr.PatchVersion = 6;
      pvrr.PackageType = 'Managed';
      pvrr.CodeCoverage = { apexCodeCoveragePercentage: 33 };
      pvrr.HasMetadataRemoved = true;
      pvrr.Description = 'test description';
      const pvrrm = Object.assign({} as PackageVersionReportResultModified, pvrr) as PackageVersionReportResultModified;
      pvrrm.Version = '0.0.6.0';
      pvrrm.AncestorId = 'N/A';
      pvrrm.AncestorId = 'N/A';
      pvrrm.Package2.IsOrgDependent = 'N/A';
      pvrrm.CodeCoverage = '33%';
      pvrrm.HasMetadataRemoved = 'Yes';
      pvrrm.HasPassedCodeCoverageCheck = 'N/A';
      delete pvrrm['PackageType'];

      const result = cmd['massageResultsForDisplay'](pvrr);
      expect(result).to.deep.equal(pvrrm);
    });
    it('should massage results - isOrgDependent && skipped validation', () => {
      const pvrr = Object.assign({}, pkgVersionReportResult);
      pvrr.PatchVersion = 6;
      pvrr.PackageType = 'Unlocked';
      pvrr.CodeCoverage = { apexCodeCoveragePercentage: 33 };
      pvrr.HasMetadataRemoved = true;
      pvrr.Package2.IsOrgDependent = true;
      pvrr.ValidationSkipped = true;
      const pvrrm = Object.assign({} as PackageVersionReportResultModified, pvrr) as PackageVersionReportResultModified;
      pvrrm.Version = '0.0.6.0';
      pvrrm.AncestorId = 'N/A';
      pvrrm.AncestorId = 'N/A';
      pvrrm.Package2.IsOrgDependent = 'No';
      pvrrm.CodeCoverage = 'N/A';
      pvrrm.HasMetadataRemoved = 'N/A';
      pvrrm.HasPassedCodeCoverageCheck = 'N/A';

      delete pvrrm['PackageType'];

      const result = cmd['massageResultsForDisplay'](pvrr);
      expect(result).to.deep.equal(pvrrm);
    });
  });
});
