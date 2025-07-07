/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { assert, expect } from 'chai';
import { PackageBundleInstall, BundleSObjects } from '@salesforce/packaging';
import sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { PackageBundlesInstall } from '../../../src/commands/package/bundle/install.js';

const pkgBundleInstallErrorResult: BundleSObjects.PkgBundleVersionInstallReqResult = {
  Id: '08c3i000000fylXXXX',
  InstallStatus: BundleSObjects.PkgBundleVersionInstallReqStatus.error,
  PackageBundleVersionID: '1Q83i000000fxw1AAA',
  DevelopmentOrganization: '00D3i000000TNHXXXX',
  ValidationError: 'Installation failed due to validation errors',
  CreatedDate: '2022-11-03 09:21',
  CreatedById: '0053i000001ZIyXXXX',
  Error: [
    'PropertyController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Property__c',
  ],
};

const pkgBundleInstallSuccessResult: BundleSObjects.PkgBundleVersionInstallReqResult = {
  Id: '08c3i000000fylgAAA',
  InstallStatus: BundleSObjects.PkgBundleVersionInstallReqStatus.success,
  PackageBundleVersionID: '1Q83i000000fxw1AAA',
  DevelopmentOrganization: '00D3i000000TNHYCA4',
  ValidationError: '',
  CreatedDate: '2022-11-03 09:46',
  CreatedById: '0053i000001ZIyGAAW',
  Error: [],
};

const pkgBundleInstallQueuedResult: BundleSObjects.PkgBundleVersionInstallReqResult = {
  Id: '08c3i000000fylgBBB',
  InstallStatus: BundleSObjects.PkgBundleVersionInstallReqStatus.queued,
  PackageBundleVersionID: '1Q83i000000fxw1AAA',
  DevelopmentOrganization: '00D3i000000TNHYCA4',
  ValidationError: '',
  CreatedDate: '2022-11-03 10:00',
  CreatedById: '0053i000001ZIyGAAW',
  Error: [],
};

describe('package:bundle:install - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const testHubOrg = new MockTestOrgData();
  let installStub = $$.SANDBOX.stub(PackageBundleInstall, 'installBundle');
  const config = new Config({ root: import.meta.url });

  // stubs
  let logStub: sinon.SinonStub;
  let warnStub: sinon.SinonStub;

  const stubSpinner = (cmd: PackageBundlesInstall) => {
    $$.SANDBOX.stub(cmd.spinner, 'start');
    $$.SANDBOX.stub(cmd.spinner, 'stop');
    $$.SANDBOX.stub(cmd.spinner, 'status').value('');
  };

  before(async () => {
    await $$.stubAuths(testOrg, testHubOrg);
    await config.load();
  });

  beforeEach(async () => {
    logStub = $$.SANDBOX.stub(SfCommand.prototype, 'log');
    warnStub = $$.SANDBOX.stub(SfCommand.prototype, 'warn');
  });

  afterEach(() => {
    $$.restore();
  });

  describe('package:bundle:install', () => {
    it('should install a package bundle version successfully', async () => {
      installStub.resolves(pkgBundleInstallSuccessResult);

      const cmd = new PackageBundlesInstall(
        ['-b', 'TestBundle@1.0', '--target-org', 'test@org.org', '--target-dev-hub', 'test@hub.org'],
        config
      );
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(res).to.deep.equal({
        Id: '08c3i000000fylgAAA',
        InstallStatus: 'Success',
        PackageBundleVersionID: '1Q83i000000fxw1AAA',
        DevelopmentOrganization: '00D3i000000TNHYCA4',
        ValidationError: '',
        CreatedDate: '2022-11-03 09:46',
        CreatedById: '0053i000001ZIyGAAW',
        Error: [],
      });
      expect(warnStub.callCount).to.equal(0);
      expect(logStub.callCount).to.equal(1);
      expect(logStub.args[0]).to.deep.equal(['Successfully installed bundle [08c3i000000fylgAAA]']);
    });

    it('should install a package bundle version with wait option', async () => {
      installStub = $$.SANDBOX.stub(PackageBundleInstall, 'installBundle');
      installStub.resolves(pkgBundleInstallSuccessResult);

      const cmd = new PackageBundlesInstall(
        ['-b', 'TestBundle@1.0', '--target-org', 'test@org.org', '--target-dev-hub', 'test@hub.org', '-w', '10'],
        config
      );
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(res).to.deep.equal({
        Id: '08c3i000000fylgAAA',
        InstallStatus: 'Success',
        PackageBundleVersionID: '1Q83i000000fxw1AAA',
        DevelopmentOrganization: '00D3i000000TNHYCA4',
        ValidationError: '',
        CreatedDate: '2022-11-03 09:46',
        CreatedById: '0053i000001ZIyGAAW',
        Error: [],
      });
      expect(warnStub.callCount).to.equal(0);
      expect(logStub.callCount).to.equal(1);
      expect(logStub.args[0]).to.deep.equal(['Successfully installed bundle [08c3i000000fylgAAA]']);
    });

    // This test does very little to test the verbose command except make sure that it is there.
    it('should install a package bundle version with verbose option', async () => {
      installStub = $$.SANDBOX.stub(PackageBundleInstall, 'installBundle');
      installStub.resolves(pkgBundleInstallSuccessResult);

      const cmd = new PackageBundlesInstall(
        ['-b', 'TestBundle@1.0', '--target-org', 'test@org.org', '--target-dev-hub', 'test@hub.org', '--verbose'],
        config
      );
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(res).to.deep.equal({
        Id: '08c3i000000fylgAAA',
        InstallStatus: 'Success',
        PackageBundleVersionID: '1Q83i000000fxw1AAA',
        DevelopmentOrganization: '00D3i000000TNHYCA4',
        ValidationError: '',
        CreatedDate: '2022-11-03 09:46',
        CreatedById: '0053i000001ZIyGAAW',
        Error: [],
      });
      expect(warnStub.callCount).to.equal(0);
      expect(logStub.callCount).to.equal(2);
      expect(logStub.args[0]).to.deep.equal(['Install status: Success']);
      expect(logStub.args[1]).to.deep.equal(['Successfully installed bundle [08c3i000000fylgAAA]']);
    });

    it('should handle queued status', async () => {
      installStub = $$.SANDBOX.stub(PackageBundleInstall, 'installBundle');
      installStub.resolves(pkgBundleInstallQueuedResult);

      const cmd = new PackageBundlesInstall(
        ['-b', 'TestBundle@1.0', '--target-org', 'test@org.org', '--target-dev-hub', 'test@hub.org'],
        config
      );
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(res).to.deep.equal({
        Id: '08c3i000000fylgBBB',
        InstallStatus: 'Queued',
        PackageBundleVersionID: '1Q83i000000fxw1AAA',
        DevelopmentOrganization: '00D3i000000TNHYCA4',
        ValidationError: '',
        CreatedDate: '2022-11-03 10:00',
        CreatedById: '0053i000001ZIyGAAW',
        Error: [],
      });
      expect(warnStub.callCount).to.equal(0);
      expect(logStub.callCount).to.equal(1);
      expect(logStub.args[0]).to.deep.equal([
        'Bundle installation is currently Queued. You can continue to query the status using\nsf package bundle install:report -i 08c3i000000fylgBBB -o test@org.org',
      ]);
    });

    it('should handle error status', async () => {
      installStub = $$.SANDBOX.stub(PackageBundleInstall, 'installBundle');
      installStub.resolves(pkgBundleInstallErrorResult);

      try {
        const cmd = new PackageBundlesInstall(
          ['-b', 'TestBundle@1.0', '--target-org', 'test@org.org', '--target-dev-hub', 'test@hub.org'],
          config
        );
        stubSpinner(cmd);
        await cmd.run();
        assert.fail('the above should throw an error');
      } catch (e) {
        expect((e as Error).message).to.equal(
          'Encountered errors installing the bundle! Installation failed due to validation errors'
        );
      }
    });

    it('should handle error status with unknown error', async () => {
      const errorResult = { ...pkgBundleInstallErrorResult, ValidationError: '' };
      installStub = $$.SANDBOX.stub(PackageBundleInstall, 'installBundle');
      installStub.resolves(errorResult);

      try {
        const cmd = new PackageBundlesInstall(
          ['-b', 'TestBundle@1.0', '--target-org', 'test@org.org', '--target-dev-hub', 'test@hub.org'],
          config
        );
        stubSpinner(cmd);
        await cmd.run();
        assert.fail('the above should throw an error');
      } catch (e) {
        expect((e as Error).message).to.equal('Encountered errors installing the bundle! Unknown error');
      }
    });
  });
});
