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
import { Config } from '@oclif/core';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { PackageBundleInstalledList } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import sinon from 'sinon';
import { PackageBundleInstalledListCommand } from '../../../src/commands/package/bundle/installed/list.js';

describe('package:bundle:installed:list - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let getInstalledBundlesStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);

    getInstalledBundlesStub = $$.SANDBOX.stub(PackageBundleInstalledList, 'getInstalledBundles');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should list installed bundles with components', async () => {
    const mockInstalledBundles = [
      {
        Id: '1aE000000000001',
        BundleName: 'TestBundle',
        BundleId: '0Kz000000000001',
        BundleVersionId: '05i000000000001',
        BundleVersionName: 'ver 1.0',
        MajorVersion: 1,
        MinorVersion: 0,
        Description: 'Test Description',
        InstalledDate: '2024-01-01T00:00:00.000+0000',
        LastUpgradedDate: '2024-01-01T00:00:00.000+0000',
        Components: [
          {
            ExpectedPackageName: 'TestPackage',
            ExpectedPackageVersionNumber: '1.0.0.1',
            ActualPackageName: 'TestPackage',
            ActualPackageVersionNumber: '1.0.0.1',
          },
        ],
      },
    ];

    const cmd = new PackageBundleInstalledListCommand(['-o', testOrg.username], config);

    getInstalledBundlesStub.resolves(mockInstalledBundles);

    await cmd.run();

    expect(getInstalledBundlesStub.calledOnce).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.called).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.callCount).to.equal(2); // One for bundle info, one for components
  });

  it('should list multiple installed bundles', async () => {
    const mockInstalledBundles = [
      {
        Id: '1aE000000000001',
        BundleName: 'TestBundle1',
        BundleId: '0Kz000000000001',
        BundleVersionId: '05i000000000001',
        BundleVersionName: 'ver 1.0',
        MajorVersion: 1,
        MinorVersion: 0,
        Description: '',
        InstalledDate: '2024-01-01T00:00:00.000+0000',
        LastUpgradedDate: '2024-01-01T00:00:00.000+0000',
        Components: [
          {
            ExpectedPackageName: 'Package1',
            ExpectedPackageVersionNumber: '1.0.0.1',
            ActualPackageName: 'Package1',
            ActualPackageVersionNumber: '1.0.0.1',
          },
        ],
      },
      {
        Id: '1aE000000000002',
        BundleName: 'TestBundle2',
        BundleId: '0Kz000000000002',
        BundleVersionId: '05i000000000002',
        BundleVersionName: 'ver 2.0',
        MajorVersion: 2,
        MinorVersion: 0,
        Description: '',
        InstalledDate: '2024-01-02T00:00:00.000+0000',
        LastUpgradedDate: '2024-01-02T00:00:00.000+0000',
        Components: [
          {
            ExpectedPackageName: 'Package2',
            ExpectedPackageVersionNumber: '2.0.0.1',
            ActualPackageName: 'Package2',
            ActualPackageVersionNumber: '2.0.0.1',
          },
        ],
      },
    ];

    const cmd = new PackageBundleInstalledListCommand(['-o', testOrg.username], config);

    getInstalledBundlesStub.resolves(mockInstalledBundles);

    await cmd.run();

    expect(getInstalledBundlesStub.calledOnce).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.called).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.callCount).to.equal(4); // Two bundles × (info + components)
  });

  it('should handle bundles with version mismatches', async () => {
    const mockInstalledBundles = [
      {
        Id: '1aE000000000001',
        BundleName: 'TestBundle',
        BundleId: '0Kz000000000001',
        BundleVersionId: '05i000000000001',
        BundleVersionName: 'ver 1.0',
        MajorVersion: 1,
        MinorVersion: 0,
        Description: '',
        InstalledDate: '2024-01-01T00:00:00.000+0000',
        LastUpgradedDate: '2024-01-01T00:00:00.000+0000',
        Components: [
          {
            ExpectedPackageName: 'TestPackage',
            ExpectedPackageVersionNumber: '1.0.0.1',
            ActualPackageName: 'TestPackage',
            ActualPackageVersionNumber: '2.0.0.1',
          },
        ],
      },
    ];

    const cmd = new PackageBundleInstalledListCommand(['-o', testOrg.username], config);

    getInstalledBundlesStub.resolves(mockInstalledBundles);

    await cmd.run();

    expect(getInstalledBundlesStub.calledOnce).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.called).to.be.true;
  });

  it('should handle bundles with uninstalled packages', async () => {
    const mockInstalledBundles = [
      {
        Id: '1aE000000000001',
        BundleName: 'TestBundle',
        BundleId: '0Kz000000000001',
        BundleVersionId: '05i000000000001',
        BundleVersionName: 'ver 1.0',
        MajorVersion: 1,
        MinorVersion: 0,
        Description: '',
        InstalledDate: '2024-01-01T00:00:00.000+0000',
        LastUpgradedDate: '2024-01-01T00:00:00.000+0000',
        Components: [
          {
            ExpectedPackageName: 'TestPackage',
            ExpectedPackageVersionNumber: '1.0.0.1',
            ActualPackageName: 'Uninstalled',
            ActualPackageVersionNumber: 'N/A',
          },
        ],
      },
    ];

    const cmd = new PackageBundleInstalledListCommand(['-o', testOrg.username], config);

    getInstalledBundlesStub.resolves(mockInstalledBundles);

    await cmd.run();

    expect(getInstalledBundlesStub.calledOnce).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.called).to.be.true;
  });

  it('should show warning when no installed bundles found', async () => {
    const cmd = new PackageBundleInstalledListCommand(['-o', testOrg.username], config);

    getInstalledBundlesStub.resolves([]);

    await cmd.run();

    expect(getInstalledBundlesStub.calledOnce).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.warn.calledOnce).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.warn.firstCall.args[0]).to.include('No installed package bundles found');
  });

  it('should handle bundles without components', async () => {
    const mockInstalledBundles = [
      {
        Id: '1aE000000000001',
        BundleName: 'TestBundle',
        BundleId: '0Kz000000000001',
        BundleVersionId: '05i000000000001',
        BundleVersionName: 'ver 1.0',
        MajorVersion: 1,
        MinorVersion: 0,
        Description: '',
        InstalledDate: '2024-01-01T00:00:00.000+0000',
        LastUpgradedDate: '2024-01-01T00:00:00.000+0000',
        Components: [],
      },
    ];

    const cmd = new PackageBundleInstalledListCommand(['-o', testOrg.username], config);

    getInstalledBundlesStub.resolves(mockInstalledBundles);

    await cmd.run();

    expect(getInstalledBundlesStub.calledOnce).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.called).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.callCount).to.equal(1); // Only bundle info, no components table
  });

  it('should throw error when target org flag is missing', async () => {
    const cmd = new PackageBundleInstalledListCommand([], config);

    getInstalledBundlesStub.resolves([]);

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include('No default environment found');
    }
  });
});
