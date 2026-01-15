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
import { Config } from '@oclif/core';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { PackageBundleInstall, BundleSObjects } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import sinon from 'sinon';
import { PackageBundleInstallListCommand } from '../../../src/commands/package/bundle/install/list.js';

describe('package:bundle:install:list - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let getInstallStatusesStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);

    getInstallStatusesStub = $$.SANDBOX.stub(PackageBundleInstall, 'getInstallStatuses');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should list bundle install requests', async () => {
    const cmd = new PackageBundleInstallListCommand(['--target-org', testOrg.username], config);

    const mockResults: BundleSObjects.PkgBundleVersionInstallReqResult[] = [
      {
        Id: 'test-id-1',
        InstallStatus: BundleSObjects.PkgBundleVersionInstallReqStatus.success,
        PackageBundleVersionId: 'bundle-version-id-1',
        DevelopmentOrganization: 'dev-org-1',
        CreatedDate: '2023-01-01T00:00:00Z',
        CreatedById: 'user-id-1',
        ValidationError: '',
        Error: [],
      },
    ];

    getInstallStatusesStub.resolves(mockResults);

    await cmd.run();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledOnce).to.be.true;
    expect(getInstallStatusesStub.calledOnce).to.be.true;
  });

  it('should show warning when no results found', async () => {
    const cmd = new PackageBundleInstallListCommand(['--target-org', testOrg.username], config);

    getInstallStatusesStub.resolves([]);

    await cmd.run();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.warn.calledOnce).to.be.true;
    expect(sfCommandStubs.warn.firstCall.args[0]).to.equal('No results found');
  });

  // This test does very little to test the verbose command except make sure that it is there.
  it('should handle verbose flag', async () => {
    const cmd = new PackageBundleInstallListCommand(['--target-org', testOrg.username, '--verbose'], config);

    const mockResults: BundleSObjects.PkgBundleVersionInstallReqResult[] = [
      {
        Id: 'test-id-1',
        InstallStatus: BundleSObjects.PkgBundleVersionInstallReqStatus.error,
        PackageBundleVersionId: 'bundle-version-id-1',
        DevelopmentOrganization: 'dev-org-1',
        CreatedDate: '2023-01-01T00:00:00Z',
        CreatedById: 'user-id-1',
        ValidationError: 'Installation failed',
        Error: ['Test error'],
      },
    ];

    getInstallStatusesStub.resolves(mockResults);

    await cmd.run();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledOnce).to.be.true;
    expect(getInstallStatusesStub.calledOnce).to.be.true;
  });
});
