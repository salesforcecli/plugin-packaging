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
import { PackageBundleInstall, BundleSObjects } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import sinon from 'sinon';
import { PackageBundleInstallReportCommand } from '../../../src/commands/package/bundle/install/report.js';

describe('package:bundle:install:report - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let getInstallStatusStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);

    getInstallStatusStub = $$.SANDBOX.stub(PackageBundleInstall, 'getInstallStatus');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should report on a package bundle installation request', async () => {
    const requestId = '0Ho0x0000000000000';
    const mockResult: BundleSObjects.PkgBundleVersionInstallReqResult = {
      Id: requestId,
      InstallStatus: BundleSObjects.PkgBundleVersionInstallReqStatus.queued,
      PackageBundleVersionId: '0Ho0x0000000000001',
      DevelopmentOrganization: 'test-org@example.com',
      ValidationError: '',
      CreatedDate: '2025-01-01T00:00:00.000+0000',
      CreatedById: '0050x0000000000001',
      Error: [],
    };

    getInstallStatusStub.resolves(mockResult);

    const cmd = new PackageBundleInstallReportCommand(
      ['--package-install-request-id', requestId, '--target-org', testOrg.username],
      config
    );

    await cmd.run();

    expect(getInstallStatusStub.calledOnce).to.be.true;
    expect(getInstallStatusStub.firstCall.args[0]).to.equal(requestId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledOnce).to.be.true;
  });

  it('should report on a package bundle installation request using alias flag', async () => {
    const requestId = '0Ho0x0000000000000';
    const mockResult: BundleSObjects.PkgBundleVersionInstallReqResult = {
      Id: requestId,
      InstallStatus: BundleSObjects.PkgBundleVersionInstallReqStatus.success,
      PackageBundleVersionId: '0Ho0x0000000000001',
      DevelopmentOrganization: 'test-org@example.com',
      ValidationError: '',
      CreatedDate: '2025-01-01T00:00:00.000+0000',
      CreatedById: '0050x0000000000001',
      Error: [],
    };

    getInstallStatusStub.resolves(mockResult);

    const cmd = new PackageBundleInstallReportCommand(['-i', requestId, '--target-org', testOrg.username], config);

    await cmd.run();

    expect(getInstallStatusStub.calledOnce).to.be.true;
    expect(getInstallStatusStub.firstCall.args[0]).to.equal(requestId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledOnce).to.be.true;
  });

  it('should throw error when package-install-request-id flag is missing', async () => {
    const cmd = new PackageBundleInstallReportCommand(['--target-org', testOrg.username], config);

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include('Missing required flag');
    }
  });

  // This test: should be rewritten once we have a unfied devhub and bundle, and should be rewritten to be "No default org found"
  it('should throw error when target-dev-hub flag is missing', async () => {
    const requestId = '0Ho0x0000000000000';
    const cmd = new PackageBundleInstallReportCommand(['--package-install-request-id', requestId], config);

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include('No default environment found');
    }
  });

  it('should handle API errors gracefully', async () => {
    const requestId = '0Ho0x0000000000000';
    const errorMessage = 'Package bundle installation request not found';

    getInstallStatusStub.rejects(new Error(errorMessage));

    const cmd = new PackageBundleInstallReportCommand(
      ['--package-install-request-id', requestId, '--target-org', testOrg.username],
      config
    );

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include(errorMessage);
    }
  });
});
