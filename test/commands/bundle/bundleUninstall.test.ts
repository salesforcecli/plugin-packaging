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
import { BundleSObjects, PackageBundleUninstall } from '@salesforce/packaging';
import sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { PackageBundleUninstallCommand } from '../../../src/commands/package/bundle/uninstall.js';

describe('package:bundle:uninstall - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: import.meta.url });

  let uninstallStub = $$.SANDBOX.stub(PackageBundleUninstall, 'uninstallBundle');
  let logStub: sinon.SinonStub;
  let warnStub: sinon.SinonStub;

  const stubSpinner = (cmd: PackageBundleUninstallCommand) => {
    $$.SANDBOX.stub(cmd.spinner, 'start');
    $$.SANDBOX.stub(cmd.spinner, 'stop');
    $$.SANDBOX.stub(cmd.spinner, 'status').value('');
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

  it('uninstalls a bundle version successfully', async () => {
    const successResult: BundleSObjects.PkgBundleVerUninstallReqResult = {
      Id: '1aF000000000001',
      UninstallStatus: BundleSObjects.PkgBundleVersionUninstallReqStatus.success,
      PackageBundleVersionId: '1Q8000000000001',
      InstalledPkgBundleVersionId: '08c000000000001',
      ValidationError: '',
      CreatedDate: '2025-01-01T00:00:00Z',
      CreatedById: '005000000000001',
    };
    uninstallStub.resolves(successResult);

    const cmd = new PackageBundleUninstallCommand(
      ['-b', 'MyBundle@1.0', '--target-org', testOrg.username],
      config
    );
    stubSpinner(cmd);
    const res = await cmd.run();

    expect(res).to.deep.equal(successResult);
    expect(warnStub.callCount).to.equal(0);
    expect(logStub.callCount).to.equal(1);
    expect(logStub.args[0]).to.deep.equal([
      `Successfully uninstalled bundle version 1Q8000000000001 from ${testOrg.username}`,
    ]);
  });

  it('logs in-progress uninstall status', async () => {
    const queuedResult: BundleSObjects.PkgBundleVerUninstallReqResult = {
      Id: '1aF000000000002',
      UninstallStatus: BundleSObjects.PkgBundleVersionUninstallReqStatus.queued,
      PackageBundleVersionId: '1Q8000000000002',
      InstalledPkgBundleVersionId: '08c000000000002',
      ValidationError: '',
      CreatedDate: '2025-01-01T00:00:00Z',
      CreatedById: '005000000000002',
    };
    uninstallStub = $$.SANDBOX.stub(PackageBundleUninstall, 'uninstallBundle');
    uninstallStub.resolves(queuedResult);

    const cmd = new PackageBundleUninstallCommand(['-b', '1Q8000000000002', '--target-org', testOrg.username], config);
    stubSpinner(cmd);
    const res = await cmd.run();

    expect(res).to.deep.equal(queuedResult);
    expect(logStub.callCount).to.equal(1);
    const msg = String(logStub.args[0][0]).replace(/\r\n/g, '\n');
    expect(msg).to.equal(
      `Bundle uninstall is currently Queued. Request Id: 1aF000000000002. Target org: ${testOrg.username}`
    );
  });

  it('throws when uninstall status is error', async () => {
    const errorResult: BundleSObjects.PkgBundleVerUninstallReqResult = {
      Id: '1aF000000000003',
      UninstallStatus: BundleSObjects.PkgBundleVersionUninstallReqStatus.error,
      PackageBundleVersionId: '1Q8000000000003',
      InstalledPkgBundleVersionId: '08c000000000003',
      ValidationError: 'Failed uninstall',
      CreatedDate: '2025-01-01T00:00:00Z',
      CreatedById: '005000000000003',
    };
    uninstallStub = $$.SANDBOX.stub(PackageBundleUninstall, 'uninstallBundle');
    uninstallStub.resolves(errorResult);

    try {
      const cmd = new PackageBundleUninstallCommand(
        ['-b', '1Q8000000000003', '--target-org', testOrg.username],
        config
      );
      stubSpinner(cmd);
      await cmd.run();
      assert.fail('the above should throw an error');
    } catch (e) {
      expect((e as Error).message).to.equal('Encountered errors uninstalling the bundle! Failed uninstall');
    }
  });
});

