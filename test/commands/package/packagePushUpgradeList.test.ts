/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Config } from '@oclif/core';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { env } from '@salesforce/kit';
import { PackagePushUpgrade, PackagePushRequestListResult } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { PackagePushRequestListCommand } from '../../../src/commands/package/pushupgrade/list.js';

const pushUpgradeListSuccess: PackagePushRequestListResult[] = [
  {
    Id: '0Af0M000000AxuqSAC',
    PackageVersionId: '04t0M000000AxuqSAC',
    PackageVersion: {
      Name: 'VersionName',
      MajorVersion: '1',
      MinorVersion: '1',
    },
    Status: 'Success',
    ScheduledStartTime: '2024-01-02T00:00:00.000Z',
    StartTime: '2024-01-02T00:01:00.000Z',
    EndTime: '2024-01-02T00:10:00.000Z',
    OrgsScheduled: 2,
    OrgsUpgradeFailed: 0,
    OrgsUpgradeSucceeded: 2,
  },
];

describe('package:pushupgrade:list - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let listStub: sinon.SinonStub;
  let getTotalJobsStub: sinon.SinonStub;
  let getFailedJobsStub: sinon.SinonStub;
  let getSucceededJobsStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    listStub = $$.SANDBOX.stub(PackagePushUpgrade, 'list');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    getTotalJobsStub = $$.SANDBOX.stub(PackagePushUpgrade, 'getTotalJobs');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    getFailedJobsStub = $$.SANDBOX.stub(PackagePushUpgrade, 'getFailedJobs');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    getSucceededJobsStub = $$.SANDBOX.stub(PackagePushUpgrade, 'getSucceededJobs');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should list the push upgrade requests', async () => {
    const cmd = new PackagePushRequestListCommand(['-v', testOrg.username], config);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    listStub.resolves(pushUpgradeListSuccess);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    getTotalJobsStub.resolves(3);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    getFailedJobsStub.resolves(1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    getSucceededJobsStub.resolves(2);

    const envSpy = $$.SANDBOX.spy(env, 'setBoolean').withArgs('SF_APPLY_REPLACEMENTS_ON_CONVERT', true);

    await cmd.run();

    expect(envSpy.calledOnce).to.equal(false);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledOnce).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.warn.calledOnce).to.be.false;
  });

  it('should handle no results found', async () => {
    const cmd = new PackagePushRequestListCommand(['-v', testOrg.username], config);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    listStub.resolves([]);

    await cmd.run();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.warn.calledOnce).to.be.true;
  });

  it('should filter by is-migration flag', async () => {
    const packageId = '033XXXXXXXXXXXXXXX';
    const cmdArgs = ['--target-dev-hub', testOrg.username, '--package', packageId, '--is-migration'];
    const cmd = new PackagePushRequestListCommand(cmdArgs, config);

    listStub.resolves(pushUpgradeListSuccess);
    getTotalJobsStub.resolves(2);
    getFailedJobsStub.resolves(0);
    getSucceededJobsStub.resolves(2);

    await cmd.run();

    expect(listStub.calledOnce).to.be.true;

    const listArgs = listStub.firstCall.args;
    expect(listArgs[1]).to.deep.include({
      packageId,
      isMigration: true,
      status: undefined,
      scheduledLastDays: undefined,
    });

    expect(sfCommandStubs.table.calledOnce).to.be.true;
    expect(sfCommandStubs.warn.calledOnce).to.be.false;
  });
});
