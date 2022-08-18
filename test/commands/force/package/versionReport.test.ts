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
import { Result } from '@salesforce/command';
import { PackageVersionReportCommand } from '../../../../src/commands/force/package/beta/version/report';

const $$ = testSetup();
const oclifConfigStub = fromStub(stubInterface<Config>($$.SANDBOX));
let uxLogStub: sinon.SinonStub;
let uxTableStub: sinon.SinonStub;

const pkgVersionReportResult: PackageVersionReportResult = {
  AncestorId: '',
  AncestorVersion: '',
  Branch: '',
  BuildDurationInSeconds: 0,
  BuildNumber: 0,
  CodeCoverage: undefined,
  CodeCoveragePercentages: { codeCovPercentages: [{ className: '', codeCoveragePercentage: 0 }] },
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
  Package2: undefined,
  Package2Id: '',
  PatchVersion: 0,
  ReleaseVersion: 0,
  SubscriberPackageVersion: undefined,
  SubscriberPackageVersionId: '',
  SystemModstamp: 0,
  Tag: '',
  ValidationSkipped: false,
  Version: '',
};

class TestCommand extends PackageVersionReportCommand {
  public async runIt() {
    this.result = new Result(this.statics.result);
    await this.init();
    uxLogStub = stubMethod($$.SANDBOX, this.ux, 'log');
    uxTableStub = stubMethod($$.SANDBOX, this.ux, 'table');
    this.result.data = await this.run();
    await this.finally(undefined);
    return this.result.data;
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

describe('force:package:install:report', () => {
  afterEach(() => {
    $$.SANDBOX.restore();
  });

  it('should report SUCCESS status', async () => {
    const reportResult = Object.assign({}, pkgVersionReportResult, { Status: 'SUCCESS' });
    $$.SANDBOX.stub(PackageVersion.prototype, 'report').resolves(reportResult);
    const result = await runCmd(['-p', pkgVersionReportResult.Id, '-v', 'test@hub.org']);
    expect(result).to.deep.equal(reportResult);
    expect(uxLogStub.calledOnce).to.be.true;
    expect(uxTableStub.calledOnce).to.be.true;
    expect(uxLogStub.args[0][0]).to.equal('Successfully installed package [04t6A000002zgKSQAY]');
  });
});
