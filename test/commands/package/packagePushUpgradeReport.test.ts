/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { PackagePushRequestReportResult, PackagePushUpgrade } from '@salesforce/packaging';
import { env } from '@salesforce/kit';
import { PackagePushUpgradeReportCommand } from '../../../src/commands/package/pushupgrade/report.js';

const pushUpgradeReportSuccess: PackagePushRequestReportResult[] = [
  {
    PackageVersion: {
      MetadataPackage: {
        Name: 'PackageName',
        NamespacePrefix: 'Namespace',
      },
      MetadataPackageId: '0330M000000Axuq',
      Name: 'VersionName',
    },
    PackageVersionId: '04t0M000000AxuqSAC',
    Id: '0DVxx0000004CCG',
    Status: 'Created',
    DurationSeconds: 60,
    ScheduledStartTime: '2024-01-02T00:00:00.000Z',
    StartTime: '2024-01-02T00:01:00.000Z',
    EndTime: '2024-01-02T00:10:00.000Z',
  },
];

describe('package:pushupgrade:report - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const createStub = $$.SANDBOX.stub(PackagePushUpgrade, 'report');
  const createTotalJobs = $$.SANDBOX.stub(PackagePushUpgrade, 'getTotalJobs');
  const createFailedJobs = $$.SANDBOX.stub(PackagePushUpgrade, 'getFailedJobs');
  const createSucceededJobs = $$.SANDBOX.stub(PackagePushUpgrade, 'getSucceededJobs');
  const config = new Config({ root: import.meta.url });

  const stubSpinner = (cmd: PackagePushUpgradeReportCommand) => {
    $$.SANDBOX.stub(cmd.spinner, 'start');
    $$.SANDBOX.stub(cmd.spinner, 'stop');
  };

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  afterEach(() => {
    $$.restore();
  });

  it('should report push upgrade request', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    createStub.resolves(pushUpgradeReportSuccess);
    createTotalJobs.resolves(1);
    createFailedJobs.resolves(0);
    createSucceededJobs.resolves(1);

    const envSpy = $$.SANDBOX.spy(env, 'setBoolean').withArgs('SF_APPLY_REPLACEMENTS_ON_CONVERT', true);

    const cmd = new PackagePushUpgradeReportCommand(['-i', '0DVxx0000004CCG', '-v', 'test@hub.org'], config);
    stubSpinner(cmd);
    const res = await cmd.run();
    expect(envSpy.calledOnce).to.equal(false);
    expect(res).to.eq(pushUpgradeReportSuccess[0]);
  });

  it('should fail to report push upgrade', async () => {
    createStub.rejects(new Error('Failed to report push upgrade'));
    const envSpy = $$.SANDBOX.spy(env, 'setBoolean').withArgs('SF_APPLY_REPLACEMENTS_ON_CONVERT', true);

    const cmd = new PackagePushUpgradeReportCommand(['-i', '0DVxx0000004CCG', '-v', 'test@hub.org'], config);
    stubSpinner(cmd);

    try {
      await cmd.run();
      throw new Error('Failed to report push upgrade');
    } catch (error) {
      expect((error as Error).message).to.equal('Failed to report push upgrade');
      expect(envSpy.calledOnce).to.equal(false);
    }
  });
});
