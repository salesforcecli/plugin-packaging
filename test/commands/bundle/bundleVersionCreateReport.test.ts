/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Config } from '@oclif/core';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { PackageBundleVersionCreate, BundleSObjects } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import sinon from 'sinon';
import { PackageBundleVersionCreateReportCommand } from '../../../src/commands/package/bundle/version/create/report.js';

describe('force:package:bundle:version:create:report - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let getCreateStatusStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);

    getCreateStatusStub = $$.SANDBOX.stub(PackageBundleVersionCreate, 'getCreateStatus');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should report on a package bundle version creation request', async () => {
    const requestId = '0Ho0x0000000000000';
    const mockResult: BundleSObjects.PackageBundleVersionCreateRequestResult = {
      Id: requestId,
      RequestStatus: BundleSObjects.PkgBundleVersionCreateReqStatus.queued,
      PackageBundleId: '0Ho0x0000000000001',
      PackageBundleVersionId: '0Ho0x0000000000002',
      VersionName: '1.0.0',
      MajorVersion: '1',
      MinorVersion: '0',
      BundleVersionComponents: '[{"packageId": "0Ho0x0000000000001", "versionNumber": "1.0.0"}]',
      Error: [],
      CreatedDate: '2025-01-01T00:00:00.000+0000',
      CreatedById: '0050x0000000000001',
      Ancestor: null,
    };

    getCreateStatusStub.resolves(mockResult);

    const cmd = new PackageBundleVersionCreateReportCommand(
      ['--package-create-request-id', requestId, '--target-dev-hub', testOrg.username],
      config
    );

    await cmd.run();

    expect(getCreateStatusStub.calledOnce).to.be.true;
    expect(getCreateStatusStub.firstCall.args[0]).to.equal(requestId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledOnce).to.be.true;
  });

  it('should report on a package bundle version creation request using alias flag', async () => {
    const requestId = '0Ho0x0000000000000';
    const mockResult: BundleSObjects.PackageBundleVersionCreateRequestResult = {
      Id: requestId,
      RequestStatus: BundleSObjects.PkgBundleVersionCreateReqStatus.success,
      PackageBundleId: '0Ho0x0000000000001',
      PackageBundleVersionId: '0Ho0x0000000000002',
      VersionName: '1.0.0',
      MajorVersion: '1',
      MinorVersion: '0',
      BundleVersionComponents: '[{"packageId": "0Ho0x0000000000001", "versionNumber": "1.0.0"}]',
      Error: [],
      CreatedDate: '2025-01-01T00:00:00.000+0000',
      CreatedById: '0050x0000000000001',
      Ancestor: null,
    };

    getCreateStatusStub.resolves(mockResult);

    const cmd = new PackageBundleVersionCreateReportCommand(
      ['-i', requestId, '--target-dev-hub', testOrg.username],
      config
    );

    await cmd.run();

    expect(getCreateStatusStub.calledOnce).to.be.true;
    expect(getCreateStatusStub.firstCall.args[0]).to.equal(requestId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledOnce).to.be.true;
  });

  it('should throw error when package-create-request-id flag is missing', async () => {
    const cmd = new PackageBundleVersionCreateReportCommand(['--target-dev-hub', testOrg.username], config);

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include('Missing required flag');
    }
  });

  it('should throw error when target-dev-hub flag is missing', async () => {
    const requestId = '0Ho0x0000000000000';
    const cmd = new PackageBundleVersionCreateReportCommand(['--package-create-request-id', requestId], config);

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include('No default dev hub found');
    }
  });

  it('should handle API errors gracefully', async () => {
    const requestId = '0Ho0x0000000000000';
    const errorMessage = 'Package bundle version creation request not found';

    getCreateStatusStub.rejects(new Error(errorMessage));

    const cmd = new PackageBundleVersionCreateReportCommand(
      ['--package-create-request-id', requestId, '--target-dev-hub', testOrg.username],
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
