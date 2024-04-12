/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import os from 'node:os';
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { assert, expect } from 'chai';
import { PackageVersion, PackageVersionCreateRequestResult, PackagingSObjects } from '@salesforce/packaging';
import sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { env } from '@salesforce/kit';
import { PackageVersionCreateCommand } from '../../../src/commands/package/version/create.js';
import Package2VersionStatus = PackagingSObjects.Package2VersionStatus;

const pkgVersionCreateErrorResult: Partial<PackageVersionCreateRequestResult> = {
  Id: '08c3i000000fylXXXX',
  Status: Package2VersionStatus.error,
  Package2Id: '0Ho3i000000TNHXXXX',
  Package2VersionId: undefined,
  SubscriberPackageVersionId: undefined,
  Tag: undefined,
  Branch: undefined,
  Error: [
    'PropertyController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Broker__c',
  ],
  CreatedDate: '2022-11-03 09:21',
  HasMetadataRemoved: undefined,
  CreatedBy: '0053i000001ZIyXXXX',
};

const pkgVersionCreateSuccessResult: Partial<PackageVersionCreateRequestResult> = {
  Id: '08c3i000000fylgAAA',
  Status: Package2VersionStatus.success,
  Package2Id: '0Ho3i000000TNHYCA4',
  Package2VersionId: '05i3i000000fxw1AAA',
  SubscriberPackageVersionId: '04t3i000002eya2AAA',
  Tag: undefined,
  Branch: undefined,
  Error: [],
  CreatedDate: '2022-11-03 09:46',
  HasMetadataRemoved: false,
  CreatedBy: '0053i000001ZIyGAAW',
};

describe('package:version:create - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let createStub = $$.SANDBOX.stub(PackageVersion, 'create');
  const config = new Config({ root: import.meta.url });

  // stubs
  let logStub: sinon.SinonStub;

  const stubSpinner = (cmd: PackageVersionCreateCommand) => {
    $$.SANDBOX.stub(cmd.spinner, 'start');
    $$.SANDBOX.stub(cmd.spinner, 'stop');
  };

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  beforeEach(async () => {
    logStub = $$.SANDBOX.stub(SfCommand.prototype, 'log');
  });

  afterEach(() => {
    $$.restore();
  });

  describe('package:version:create', () => {
    it('should create a new package version', async () => {
      createStub.resolves(pkgVersionCreateSuccessResult);
      const envSpy = $$.SANDBOX.spy(env, 'setBoolean').withArgs('SF_APPLY_REPLACEMENTS_ON_CONVERT', true);

      const cmd = new PackageVersionCreateCommand(['-p', '05i3i000000Gmj6XXX', '-v', 'test@hub.org', '-x'], config);
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(envSpy.calledOnce).to.equal(true);
      expect(res).to.deep.equal({
        Branch: undefined,
        CreatedBy: '0053i000001ZIyGAAW',
        CreatedDate: '2022-11-03 09:46',
        Error: [],
        HasMetadataRemoved: false,
        Id: '08c3i000000fylgAAA',
        Package2Id: '0Ho3i000000TNHYCA4',
        Package2VersionId: '05i3i000000fxw1AAA',
        Status: 'Success',
        SubscriberPackageVersionId: '04t3i000002eya2AAA',
        Tag: undefined,
      });
      expect(logStub.callCount).to.equal(1);
      expect(logStub.args[0]).to.deep.equal([
        `Successfully created the package version [08c3i000000fylgAAA]. Subscriber Package Version Id: 04t3i000002eya2AAA${os.EOL}Package Installation URL: https://login.salesforce.com/packaging/installPackage.apexp?p0=04t3i000002eya2AAA${os.EOL}As an alternative, you can use the "sf package:install" command.`,
      ]);
    });

    it('should report multiple errors', async () => {
      createStub = $$.SANDBOX.stub(PackageVersion, 'create');
      createStub.resolves(pkgVersionCreateErrorResult);
      try {
        const cmd = new PackageVersionCreateCommand(['-p', '05i3i000000Gmj6XXX', '-v', 'test@hub.org', '-x'], config);
        stubSpinner(cmd);
        await cmd.run();
        assert.fail('the above should throw multiple errors');
      } catch (e) {
        expect((e as Error).message).to.equal(
          `Multiple errors occurred: ${os.EOL}(1) PropertyController: Invalid type: Schema.Property__c${os.EOL}(2) SampleDataController: Invalid type: Schema.Property__c${os.EOL}(3) SampleDataController: Invalid type: Schema.Broker__c`
        );
      }
    });
  });
});
