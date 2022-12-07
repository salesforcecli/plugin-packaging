/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Org, SfProject } from '@salesforce/core';
import { TestContext } from '@salesforce/core/lib/testSetup';
import { fromStub, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { PackageVersion, PackageVersionCreateRequestResult, PackagingSObjects } from '@salesforce/packaging';
import { PackageVersionCreateReportCommand } from '../../../../src/commands/force/package/beta/version/create/report';

import Package2VersionStatus = PackagingSObjects.Package2VersionStatus;

describe('force:package:version:create:report - tests', () => {
  const $$ = new TestContext();
  let createStatusStub = $$.SANDBOX.stub(PackageVersion, 'getCreateStatus');
  let tableStub: sinon.SinonStub;
  let styledHeaderStub: sinon.SinonStub;
  let logStub: sinon.SinonStub;
  const oclifConfigStub = fromStub(stubInterface<Config>($$.SANDBOX));

  const pkgVersionCreateErrorResult: PackageVersionCreateRequestResult = {
    Id: '08c3i000000fylXXXX',
    Status: Package2VersionStatus.error,
    Package2Id: '0Ho3i000000TNHXXXX',
    Package2VersionId: null,
    SubscriberPackageVersionId: null,
    Tag: null,
    Branch: null,
    Error: [
      'PropertyController: Invalid type: Schema.Property__c',
      'SampleDataController: Invalid type: Schema.Property__c',
      'SampleDataController: Invalid type: Schema.Broker__c',
    ],
    CreatedDate: '2022-11-03 09:21',
    HasMetadataRemoved: null,
    CreatedBy: '0053i000001ZIyXXXX',
  };
  const pkgVersionCreateSuccessResult: PackageVersionCreateRequestResult = {
    Id: '08c3i000000fylgAAA',
    Status: Package2VersionStatus.success,
    Package2Id: '0Ho3i000000TNHYCA4',
    Package2VersionId: '05i3i000000fxw1AAA',
    SubscriberPackageVersionId: '04t3i000002eya2AAA',
    Tag: null,
    Branch: null,
    Error: [],
    CreatedDate: '2022-11-03 09:46',
    HasMetadataRemoved: false,
    CreatedBy: '0053i000001ZIyGAAW',
  };

  class TestCommand extends PackageVersionCreateReportCommand {
    public async runIt() {
      await this.init();
      styledHeaderStub = stubMethod($$.SANDBOX, this.ux, 'styledHeader');
      tableStub = stubMethod($$.SANDBOX, this.ux, 'table');
      logStub = stubMethod($$.SANDBOX, this.ux, 'log');
      return this.run();
    }

    public setProject(project: SfProject) {
      this.project = project;
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
    cmd.setProject(SfProject.getInstance());

    return cmd.runIt();
  };

  describe('force:package:version:create:report', () => {
    it('should report on a new package version', async () => {
      createStatusStub.resolves(pkgVersionCreateSuccessResult);
      const res = await runCmd(['-i', '08c3i000000fyoVAAQ', '-v', 'test@hub.org']);

      expect(res).to.deep.equal([
        {
          Branch: null,
          CreatedBy: '0053i000001ZIyGAAW',
          CreatedDate: '2022-11-03 09:46',
          Error: [],
          HasMetadataRemoved: false,
          Id: '08c3i000000fylgAAA',
          Package2Id: '0Ho3i000000TNHYCA4',
          Package2VersionId: '05i3i000000fxw1AAA',
          Status: 'Success',
          SubscriberPackageVersionId: '04t3i000002eya2AAA',
          Tag: null,
        },
      ]);
      expect(tableStub.callCount).to.equal(1);
      expect(styledHeaderStub.callCount).to.equal(1);
    });

    it('should report multiple errors', async () => {
      createStatusStub = $$.SANDBOX.stub(PackageVersion, 'getCreateStatus');
      createStatusStub.resolves(pkgVersionCreateErrorResult);

      const result = await runCmd(['-i', '08c3i000000fyoVAAQ', '-v', 'test@hub.org']);

      expect(logStub.callCount).to.equal(2);
      expect(result[0]).to.deep.equal({
        Branch: null,
        CreatedBy: '0053i000001ZIyXXXX',
        CreatedDate: '2022-11-03 09:21',
        Error: [
          'PropertyController: Invalid type: Schema.Property__c',
          'SampleDataController: Invalid type: Schema.Property__c',
          'SampleDataController: Invalid type: Schema.Broker__c',
        ],
        HasMetadataRemoved: null,
        Id: '08c3i000000fylXXXX',
        Package2Id: '0Ho3i000000TNHXXXX',
        Package2VersionId: null,
        Status: 'Error',
        SubscriberPackageVersionId: null,
        Tag: null,
      });
      expect(logStub.secondCall.args[0]).to.equal(
        '(1) PropertyController: Invalid type: Schema.Property__c\n(2) SampleDataController: Invalid type: Schema.Property__c\n(3) SampleDataController: Invalid type: Schema.Broker__c'
      );
    });
  });
});
