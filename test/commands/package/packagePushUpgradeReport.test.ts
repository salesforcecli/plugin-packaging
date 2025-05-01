/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Config } from '@oclif/core';
import { TestContext, sinon } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import {
  PackagePushUpgrade,
  PackagePushRequestReportResult,
} from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
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
      MajorVersion: '1',
      MinorVersion: '1',
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
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let reportStub: sinon.SinonStub;
  let getTotalJobsStub: sinon.SinonStub;
  let getFailedJobsStub: sinon.SinonStub;
  let getSucceededJobsStub: sinon.SinonStub;
  let getJobFailureReasonsStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths();
    await config.load();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    reportStub = $$.SANDBOX.stub(PackagePushUpgrade, 'report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    getTotalJobsStub = $$.SANDBOX.stub(PackagePushUpgrade, 'getTotalJobs');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    getFailedJobsStub = $$.SANDBOX.stub(PackagePushUpgrade, 'getFailedJobs');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    getSucceededJobsStub = $$.SANDBOX.stub(PackagePushUpgrade, 'getSucceededJobs');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    getJobFailureReasonsStub = $$.SANDBOX.stub(PackagePushUpgrade, 'getJobFailureReasons');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should report the push upgrade request', async () => {
    const cmd = new PackagePushUpgradeReportCommand(['-i', '0DVxx0000004EXTGA2', '-v', 'test@hub.org'], config);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    reportStub.resolves(pushUpgradeReportSuccess);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    getTotalJobsStub.resolves(3);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    getFailedJobsStub.resolves(1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    getSucceededJobsStub.resolves(2);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    getJobFailureReasonsStub.resolves([]);

    await cmd.run();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledOnce).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.warn.calledOnce).to.be.false;
  });

  it('should handle no results found', async () => {
    const cmd = new PackagePushUpgradeReportCommand(['-i', '0DVxx0000004EXTGA2', '-v', 'test@hub.org'], config);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    reportStub.resolves([]);

    await cmd.run();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.warn.calledOnce).to.be.true;
  });

  it('should handle errors during report', async () => {
    const cmd = new PackagePushUpgradeReportCommand(['-i', '0DVxx0000004EXTGA2', '-v', 'test@hub.org'], config);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    reportStub.rejects(new Error('Report error'));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await expect(cmd.run()).to.be.rejectedWith('Report error');
  });
});
