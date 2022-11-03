/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import { Org, SfProject } from '@salesforce/core';
import { TestContext } from '@salesforce/core/lib/testSetup';
import { fromStub, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { Config } from '@oclif/core';
import { assert, expect } from 'chai';
import { PackageVersion, PackageVersionCreateRequestResult, PackagingSObjects } from '@salesforce/packaging';
import { PackageVersionCreateCommand } from '../../../../src/commands/force/package/beta/version/create';
import Package2VersionStatus = PackagingSObjects.Package2VersionStatus;

describe('force:package:version:report - tests', () => {
  const $$ = new TestContext();
  let createStub = $$.SANDBOX.stub(PackageVersion, 'create');
  let uxLogStub: sinon.SinonStub;
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

  class TestCommand extends PackageVersionCreateCommand {
    public async runIt() {
      await this.init();
      uxLogStub = stubMethod($$.SANDBOX, this.ux, 'log');
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

  describe('force:package:version:create', () => {
    it('should create a new package version', async () => {
      createStub.resolves(pkgVersionCreateSuccessResult);
      const res = await runCmd(['-p', '05i3i000000Gmj6XXX', '-v', 'test@hub.org', '-x']);
      expect(res).to.deep.equal({
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
      });
      expect(uxLogStub.callCount).to.equal(1);
      expect(uxLogStub.args[0]).to.deep.equal([
        `Successfully created the package version [08c3i000000fylgAAA]. Subscriber Package Version Id: 04t3i000002eya2AAA${os.EOL}Package Installation URL: https://login.salesforce.com/packaging/installPackage.apexp?p0=04t3i000002eya2AAA${os.EOL}As an alternative, you can use the "sfdx force:package:install" command.`,
      ]);
    });

    it('should report multiple errors', async () => {
      createStub = $$.SANDBOX.stub(PackageVersion, 'create');
      createStub.resolves(pkgVersionCreateErrorResult);
      try {
        await runCmd(['-p', '05i3i000000Gmj6XXX', '-v', 'test@hub.org', '-x']);
        assert.fail('the above should throw multiple errors');
      } catch (e) {
        expect((e as Error).message).to.equal(
          `Package version creation failed with unknown error. ${os.EOL}(1) PropertyController: Invalid type: Schema.Property__c${os.EOL}(2) SampleDataController: Invalid type: Schema.Property__c${os.EOL}(3) SampleDataController: Invalid type: Schema.Broker__c`
        );
      }
    });
  });
});
