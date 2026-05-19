/*
 * Copyright 2026, Salesforce, Inc.
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
import { PackageBundleInstall, BundleSObjects } from '@salesforce/packaging';
import sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { PackageBundlesInstall } from '../../../src/commands/package/bundle/install.js';

describe('package:bundle:install - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const devHubOrg = new MockTestOrgData();
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
    await $$.stubAuths(testOrg, devHubOrg);
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
      const pkgBundleInstallSuccessResult: BundleSObjects.PkgBundleVersionInstallReqResult = {
        Id: '08c3i000000fylgAAA',
        InstallStatus: BundleSObjects.PkgBundleVersionInstallReqStatus.success,
        PackageBundleVersionId: '1Q83i000000fxw1AAA',
        DevelopmentOrganization: devHubOrg.orgId,
        ValidationError: '',
        CreatedDate: '2022-11-03 09:46',
        CreatedById: '0053i000001ZIyGAAW',
        Error: [],
      };
      installStub.resolves(pkgBundleInstallSuccessResult);

      const cmd = new PackageBundlesInstall(
        ['-b', 'TestBundle@1.0', '--target-org', testOrg.username, '--dev-hub-org', devHubOrg.username],
        config
      );
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(res).to.deep.equal(pkgBundleInstallSuccessResult);
      expect(warnStub.callCount).to.equal(0);
      expect(logStub.callCount).to.equal(1);
      expect(logStub.args[0][0]).to.include('Successfully installed bundle version 1Q83i000000fxw1AAA');
    });

    it('should install a package bundle version with wait option', async () => {
      installStub = $$.SANDBOX.stub(PackageBundleInstall, 'installBundle');
      const pkgBundleInstallSuccessResult: BundleSObjects.PkgBundleVersionInstallReqResult = {
        Id: '08c3i000000fylgAAA',
        InstallStatus: BundleSObjects.PkgBundleVersionInstallReqStatus.success,
        PackageBundleVersionId: '1Q83i000000fxw1AAA',
        DevelopmentOrganization: devHubOrg.orgId,
        ValidationError: '',
        CreatedDate: '2022-11-03 09:46',
        CreatedById: '0053i000001ZIyGAAW',
        Error: [],
      };
      installStub.resolves(pkgBundleInstallSuccessResult);

      const cmd = new PackageBundlesInstall(
        ['-b', 'TestBundle@1.0', '--target-org', testOrg.username, '--dev-hub-org', devHubOrg.username, '-w', '10'],
        config
      );
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(res).to.deep.equal(pkgBundleInstallSuccessResult);
      expect(warnStub.callCount).to.equal(0);
      expect(logStub.callCount).to.equal(1);
      expect(logStub.args[0][0]).to.include('Successfully installed bundle version 1Q83i000000fxw1AAA');
    });

    // This test does very little to test the verbose command except make sure that it is there.
    it('should install a package bundle version with verbose option', async () => {
      installStub = $$.SANDBOX.stub(PackageBundleInstall, 'installBundle');
      const pkgBundleInstallSuccessResult: BundleSObjects.PkgBundleVersionInstallReqResult = {
        Id: '08c3i000000fylgAAA',
        InstallStatus: BundleSObjects.PkgBundleVersionInstallReqStatus.success,
        PackageBundleVersionId: '1Q83i000000fxw1AAA',
        DevelopmentOrganization: devHubOrg.orgId,
        ValidationError: '',
        CreatedDate: '2022-11-03 09:46',
        CreatedById: '0053i000001ZIyGAAW',
        Error: [],
      };
      installStub.resolves(pkgBundleInstallSuccessResult);

      const cmd = new PackageBundlesInstall(
        ['-b', 'TestBundle@1.0', '--target-org', testOrg.username, '--dev-hub-org', devHubOrg.username, '--verbose'],
        config
      );
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(res).to.deep.equal(pkgBundleInstallSuccessResult);
      expect(warnStub.callCount).to.equal(0);
      expect(logStub.callCount).to.equal(1);
      expect(logStub.args[0][0]).to.include('Successfully installed bundle version 1Q83i000000fxw1AAA');
    });

    it('should handle queued status', async () => {
      installStub = $$.SANDBOX.stub(PackageBundleInstall, 'installBundle');
      const pkgBundleInstallQueuedResult: BundleSObjects.PkgBundleVersionInstallReqResult = {
        Id: '08c3i000000fylgBBB',
        InstallStatus: BundleSObjects.PkgBundleVersionInstallReqStatus.queued,
        PackageBundleVersionId: '1Q83i000000fxw1AAA',
        DevelopmentOrganization: devHubOrg.orgId,
        ValidationError: '',
        CreatedDate: '2022-11-03 10:00',
        CreatedById: '0053i000001ZIyGAAW',
        Error: [],
      };
      installStub.resolves(pkgBundleInstallQueuedResult);

      const cmd = new PackageBundlesInstall(
        ['-b', 'TestBundle@1.0', '--target-org', testOrg.username, '--dev-hub-org', devHubOrg.username],
        config
      );
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(res).to.deep.equal(pkgBundleInstallQueuedResult);
      expect(warnStub.callCount).to.equal(0);
      expect(logStub.callCount).to.equal(1);
      // Normalize CRLF to LF to make assertion OS-agnostic
      const queuedMsg = String(logStub.args[0][0]).replace(/\r\n/g, '\n');
      expect(queuedMsg).to.equal(
        'Bundle installation is currently Queued. You can continue to query the status using\nsf package bundle install report -i 08c3i000000fylgBBB -o ' +
          testOrg.username
      );
    });

    it('should handle error status', async () => {
      installStub = $$.SANDBOX.stub(PackageBundleInstall, 'installBundle');
      const pkgBundleInstallErrorResult: BundleSObjects.PkgBundleVersionInstallReqResult = {
        Id: '08c3i000000fylXXXX',
        InstallStatus: BundleSObjects.PkgBundleVersionInstallReqStatus.error,
        PackageBundleVersionId: '1Q83i000000fxw1AAA',
        DevelopmentOrganization: devHubOrg.orgId,
        ValidationError: 'Installation failed due to validation errors',
        CreatedDate: '2022-11-03 09:21',
        CreatedById: '0053i000001ZIyXXXX',
        Error: [
          'PropertyController: Invalid type: Schema.Property__c',
          'SampleDataController: Invalid type: Schema.Property__c',
        ],
      };
      installStub.resolves(pkgBundleInstallErrorResult);

      try {
        const cmd = new PackageBundlesInstall(
          ['-b', 'TestBundle@1.0', '--target-org', testOrg.username, '--dev-hub-org', devHubOrg.username],
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
      installStub = $$.SANDBOX.stub(PackageBundleInstall, 'installBundle');
      const errorResult: BundleSObjects.PkgBundleVersionInstallReqResult = {
        Id: '08c3i000000fylXXXX',
        InstallStatus: BundleSObjects.PkgBundleVersionInstallReqStatus.error,
        PackageBundleVersionId: '1Q83i000000fxw1AAA',
        DevelopmentOrganization: devHubOrg.orgId,
        ValidationError: '',
        CreatedDate: '2022-11-03 09:21',
        CreatedById: '0053i000001ZIyXXXX',
        Error: [
          'PropertyController: Invalid type: Schema.Property__c',
          'SampleDataController: Invalid type: Schema.Property__c',
        ],
      };
      installStub.resolves(errorResult);

      try {
        const cmd = new PackageBundlesInstall(
          ['-b', 'TestBundle@1.0', '--target-org', testOrg.username, '--dev-hub-org', devHubOrg.username],
          config
        );
        stubSpinner(cmd);
        await cmd.run();
        assert.fail('the above should throw an error');
      } catch (e) {
        expect((e as Error).message).to.equal(
          "Encountered errors installing the bundle! Bundle installation failed. Run 'sf package bundle install report -i 08c3i000000fylXXXX -o " +
            testOrg.username +
            "' for more details."
        );
      }
    });
  });
});
