/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { assert, expect } from 'chai';
import { PackageBundleVersion, BundleSObjects } from '@salesforce/packaging';
import sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { PackageBundlesCreate } from '../../../src/commands/package/bundle/version/create.js';

const pkgBundleVersionCreateErrorResult: BundleSObjects.PackageBundleVersionCreateRequestResult = {
  Id: '08c3i000000fylXXXX',
  RequestStatus: BundleSObjects.PkgBundleVersionCreateReqStatus.error,
  PackageBundleId: '0Ho3i000000TNHXXXX',
  PackageBundleVersionId: '',
  VersionName: 'TestBundle@1.0',
  MajorVersion: '1',
  MinorVersion: '0',
  BundleVersionComponents: '[]',
  Error: [
    'PropertyController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Broker__c',
  ],
  CreatedDate: '2022-11-03 09:21',
  CreatedById: '0053i000001ZIyXXXX',
  Ancestor: null,
};

const pkgBundleVersionCreateSuccessResult: BundleSObjects.PackageBundleVersionCreateRequestResult = {
  Id: '08c3i000000fylgAAA',
  RequestStatus: BundleSObjects.PkgBundleVersionCreateReqStatus.success,
  PackageBundleId: '0Ho3i000000TNHYCA4',
  PackageBundleVersionId: '05i3i000000fxw1AAA',
  VersionName: 'TestBundle@1.0',
  MajorVersion: '1',
  MinorVersion: '0',
  BundleVersionComponents: '[{"packageId": "0Ho3i000000TNHYCA4", "versionNumber": "1.0.0"}]',
  Error: [],
  CreatedDate: '2022-11-03 09:46',
  CreatedById: '0053i000001ZIyGAAW',
  Ancestor: null,
};

const pkgBundleVersionCreateQueuedResult: BundleSObjects.PackageBundleVersionCreateRequestResult = {
  Id: '08c3i000000fylgBBB',
  RequestStatus: BundleSObjects.PkgBundleVersionCreateReqStatus.queued,
  PackageBundleId: '0Ho3i000000TNHYCA4',
  PackageBundleVersionId: '',
  VersionName: 'TestBundle@1.1',
  MajorVersion: '1',
  MinorVersion: '1',
  BundleVersionComponents: '[{"packageId": "0Ho3i000000TNHYCA4", "versionNumber": "1.1.0"}]',
  Error: [],
  CreatedDate: '2022-11-03 10:00',
  CreatedById: '0053i000001ZIyGAAW',
  Ancestor: null,
};

describe('package:bundle:version:create - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let createStub = $$.SANDBOX.stub(PackageBundleVersion, 'create');
  const config = new Config({ root: import.meta.url });

  // stubs
  let logStub: sinon.SinonStub;
  let warnStub: sinon.SinonStub;

  const stubSpinner = (cmd: PackageBundlesCreate) => {
    $$.SANDBOX.stub(cmd.spinner, 'start');
    $$.SANDBOX.stub(cmd.spinner, 'stop');
  };

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  beforeEach(async () => {
    logStub = $$.SANDBOX.stub(SfCommand.prototype, 'log');
    warnStub = $$.SANDBOX.stub(SfCommand.prototype, 'warn');
  });

  afterEach(() => {
    $$.restore();
  });

  describe('package:bundle:version:create', () => {
    it('should create a new package bundle version', async () => {
      createStub.resolves(pkgBundleVersionCreateSuccessResult);

      const cmd = new PackageBundlesCreate(
        ['-b', 'TestBundle', '-p', 'path/to/definition.json', '--target-dev-hub', 'test@hub.org'],
        config
      );
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(res).to.deep.equal({
        Id: '08c3i000000fylgAAA',
        RequestStatus: 'Success',
        PackageBundleId: '0Ho3i000000TNHYCA4',
        PackageBundleVersionId: '05i3i000000fxw1AAA',
        VersionName: 'TestBundle@1.0',
        MajorVersion: '1',
        MinorVersion: '0',
        BundleVersionComponents: '[{"packageId": "0Ho3i000000TNHYCA4", "versionNumber": "1.0.0"}]',
        Error: [],
        CreatedDate: '2022-11-03 09:46',
        CreatedById: '0053i000001ZIyGAAW',
        Ancestor: null,
      });
      expect(warnStub.callCount).to.equal(0);
      expect(logStub.callCount).to.equal(1);
      expect(logStub.args[0]).to.deep.equal(['Successfully created bundle version with ID 05i3i000000fxw1AAA']);
    });

    it('should create a new package bundle version with wait option', async () => {
      createStub = $$.SANDBOX.stub(PackageBundleVersion, 'create');
      createStub.resolves(pkgBundleVersionCreateSuccessResult);

      const cmd = new PackageBundlesCreate(
        ['-b', 'TestBundle', '-p', 'path/to/definition.json', '-w', '10', '--target-dev-hub', 'test@hub.org'],
        config
      );
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(res).to.deep.equal({
        Id: '08c3i000000fylgAAA',
        RequestStatus: 'Success',
        PackageBundleId: '0Ho3i000000TNHYCA4',
        PackageBundleVersionId: '05i3i000000fxw1AAA',
        VersionName: 'TestBundle@1.0',
        MajorVersion: '1',
        MinorVersion: '0',
        BundleVersionComponents: '[{"packageId": "0Ho3i000000TNHYCA4", "versionNumber": "1.0.0"}]',
        Error: [],
        CreatedDate: '2022-11-03 09:46',
        CreatedById: '0053i000001ZIyGAAW',
        Ancestor: null,
      });
      expect(warnStub.callCount).to.equal(0);
      expect(logStub.callCount).to.equal(1);
      expect(logStub.args[0]).to.deep.equal(['Successfully created bundle version with ID 05i3i000000fxw1AAA']);
    });

    it('should create a new package bundle version with verbose option', async () => {
      createStub = $$.SANDBOX.stub(PackageBundleVersion, 'create');
      createStub.resolves(pkgBundleVersionCreateSuccessResult);

      const cmd = new PackageBundlesCreate(
        ['-b', 'TestBundle', '-p', 'path/to/definition.json', '--verbose', '--target-dev-hub', 'test@hub.org'],
        config
      );
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(res).to.deep.equal({
        Id: '08c3i000000fylgAAA',
        RequestStatus: 'Success',
        PackageBundleId: '0Ho3i000000TNHYCA4',
        PackageBundleVersionId: '05i3i000000fxw1AAA',
        VersionName: 'TestBundle@1.0',
        MajorVersion: '1',
        MinorVersion: '0',
        BundleVersionComponents: '[{"packageId": "0Ho3i000000TNHYCA4", "versionNumber": "1.0.0"}]',
        Error: [],
        CreatedDate: '2022-11-03 09:46',
        CreatedById: '0053i000001ZIyGAAW',
        Ancestor: null,
      });
      expect(warnStub.callCount).to.equal(0);
      expect(logStub.callCount).to.equal(1);
      expect(logStub.args[0]).to.deep.equal(['Successfully created bundle version with ID 05i3i000000fxw1AAA']);
    });

    it('should handle queued status', async () => {
      createStub = $$.SANDBOX.stub(PackageBundleVersion, 'create');
      createStub.resolves(pkgBundleVersionCreateQueuedResult);

      const cmd = new PackageBundlesCreate(
        ['-b', 'TestBundle', '-p', 'path/to/definition.json', '--target-dev-hub', 'test@hub.org'],
        config
      );
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(res).to.deep.equal({
        Id: '08c3i000000fylgBBB',
        RequestStatus: 'Queued',
        PackageBundleId: '0Ho3i000000TNHYCA4',
        PackageBundleVersionId: '',
        VersionName: 'TestBundle@1.1',
        MajorVersion: '1',
        MinorVersion: '1',
        BundleVersionComponents: '[{"packageId": "0Ho3i000000TNHYCA4", "versionNumber": "1.1.0"}]',
        Error: [],
        CreatedDate: '2022-11-03 10:00',
        CreatedById: '0053i000001ZIyGAAW',
        Ancestor: null,
      });
      expect(warnStub.callCount).to.equal(0);
      expect(logStub.callCount).to.equal(1);
      expect(logStub.args[0]).to.deep.equal([
        'Package bundle version creation is Queued. Use "sf package bundle version create report -i 08c3i000000fylgBBB" to check the status later.',
      ]);
    });

    it('should report multiple errors', async () => {
      createStub = $$.SANDBOX.stub(PackageBundleVersion, 'create');
      createStub.resolves(pkgBundleVersionCreateErrorResult);
      try {
        const cmd = new PackageBundlesCreate(
          ['-b', 'TestBundle', '-p', 'path/to/definition.json', '--target-dev-hub', 'test@hub.org'],
          config
        );
        stubSpinner(cmd);
        await cmd.run();
        assert.fail('the above should throw multiple errors');
      } catch (e) {
        const msg = (e as Error).message.replace(/\r\n/g, '\n');
        expect(msg).to.equal(
          'The following errors occurred during package bundle version creation:\n' +
            'PropertyController: Invalid type: Schema.Property__c\n' +
            'SampleDataController: Invalid type: Schema.Property__c\n' +
            'SampleDataController: Invalid type: Schema.Broker__c'
        );
      }
    });
  });
});
