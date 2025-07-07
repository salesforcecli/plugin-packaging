/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
        PackageBundleVersionID: 'bundle-version-id-1',
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
        PackageBundleVersionID: 'bundle-version-id-1',
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
