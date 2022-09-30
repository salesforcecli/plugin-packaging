/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Org } from '@salesforce/core';
import { testSetup } from '@salesforce/core/lib/testSetup';
import { fromStub, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { PackageVersion, PackageVersionReportResult } from '@salesforce/packaging';
import { beforeEach } from 'mocha';
import {
  PackageVersionReportCommand,
  PackageVersionReportResultModified,
  massageResultsForDisplay,
} from '../../../../src/commands/force/package/beta/version/report';

const $$ = testSetup();
const oclifConfigStub = fromStub(stubInterface<Config>($$.SANDBOX));
let uxLogStub: sinon.SinonStub;
let uxTableStub: sinon.SinonStub;
let uxStyledHeaderStub: sinon.SinonStub;

const pkgVersionReportResultModified: PackageVersionReportResultModified = {
  AncestorId: 'N/A',
  AncestorVersion: 'N/A',
  Branch: '',
  BuildDurationInSeconds: 0,
  BuildNumber: 0,
  CodeCoverage: 'N/A',
  CodeCoveragePercentages: {
    codeCovPercentages: [
      {
        className: '',
        codeCoveragePercentage: 0,
      },
    ],
  },
  ConvertedFromVersionId: '',
  CreatedById: '',
  CreatedDate: 0,
  Description: '',
  HasMetadataRemoved: 'N/A',
  HasPassedCodeCoverageCheck: false,
  Id: '',
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
  BuildDurationInSeconds: 0,
  BuildNumber: 0,
  CodeCoverage: null,
  CodeCoveragePercentages: {
    codeCovPercentages: [
      {
        className: '',
        codeCoveragePercentage: 0,
      },
    ],
  },
  ConvertedFromVersionId: '',
  CreatedById: '',
  CreatedDate: 0,
  Description: '',
  HasMetadataRemoved: false,
  HasPassedCodeCoverageCheck: false,
  Id: '',
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

class TestCommand extends PackageVersionReportCommand {
  public async runIt() {
    await this.init();
    uxLogStub = stubMethod($$.SANDBOX, this.ux, 'log');
    uxTableStub = stubMethod($$.SANDBOX, this.ux, 'table');
    uxStyledHeaderStub = stubMethod($$.SANDBOX, this.ux, 'styledHeader');
    return this.run();
  }
  public setHubOrg(org: Org) {
    this.hubOrg = org;
  }
}

const runCmd = async (params: string[]) => {
  const cmd = new TestCommand(params, oclifConfigStub);
  stubMethod($$.SANDBOX, cmd, 'assignOrg').callsFake(() => {
    const orgStub = fromStub(
      stubInterface<Org>($$.SANDBOX, {
        getUsername: () => 'test@user.com',
        getConnection: () => ({}),
      })
    );
    cmd.setHubOrg(orgStub);
  });
  return cmd.runIt();
};

describe('force:package:version:report', () => {
  afterEach(() => {
    $$.SANDBOX.restore();
  });

  it('should produce package version report', async () => {
    const reportResult = Object.assign({}, pkgVersionReportResult);
    $$.SANDBOX.stub(PackageVersion.prototype, 'report').resolves(reportResult);
    const result = await runCmd(['-p', pkgVersionReportResult.Id, '-v', 'test@hub.org']);
    expect(result).to.deep.equal(pkgVersionReportResultModified);
    expect(uxLogStub.calledOnce).to.be.false;
    expect(uxTableStub.calledOnce).to.be.true;
    expect(uxStyledHeaderStub.calledOnce).to.be.true;
    expect(uxStyledHeaderStub.args[0][0]).to.include('Package Version');
  });
  it('should produce package version report - json result', async () => {
    const reportResult = Object.assign({}, pkgVersionReportResult);
    $$.SANDBOX.stub(PackageVersion.prototype, 'report').resolves(reportResult);
    const result = await runCmd(['-p', pkgVersionReportResult.Id, '-v', 'test@hub.org', '--json']);
    expect(result).to.deep.equal(pkgVersionReportResultModified);
    expect(uxLogStub.calledOnce).to.be.false;
    expect(uxTableStub.calledOnce).to.be.false;
    expect(uxStyledHeaderStub.calledOnce).to.be.false;
  });
});
describe('massage results', () => {
  let cmd: TestCommand;
  beforeEach(() => {
    cmd = new TestCommand(['-p', pkgVersionReportResult.Id, '-v', 'test@hub.org'], oclifConfigStub);
    stubMethod($$.SANDBOX, cmd, 'assignOrg').callsFake(() => {
      const orgStub = fromStub(
        stubInterface<Org>($$.SANDBOX, {
          getUsername: () => 'test@user.com',
          getConnection: () => ({}),
        })
      );
      cmd.setHubOrg(orgStub);
    });
  });

  it('should massage results', () => {
    const result = massageResultsForDisplay(pkgVersionReportResult);
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

    const result = massageResultsForDisplay(pvrr);
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

    const result = massageResultsForDisplay(pvrr);
    expect(result).to.deep.equal(pvrrm);
  });
});
