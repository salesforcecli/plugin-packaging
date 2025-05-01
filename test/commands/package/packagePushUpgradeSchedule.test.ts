/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'node:fs/promises';
import { Config } from '@oclif/core';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { PackagePushUpgrade, PackagePushScheduleResult } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { PackagePushScheduleCommand } from '../../../src/commands/package/pushupgrade/schedule.js';

const pushReq: PackagePushScheduleResult = {
  PushRequestId: 'mockPushJobId',
  ScheduledStartTime: '2023-01-01T00:00:00Z',
  Status: 'Scheduled',
};

describe('package:pushupgrade:schedule - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let scheduleStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    scheduleStub = $$.SANDBOX.stub(PackagePushUpgrade, 'schedule');
    $$.SANDBOX.stub(fs, 'readFile').resolves('00Dxx0000001gEREAY\n00Dxx0000001gFAEA0');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should schedule the push upgrade with file', async () => {
    const cmdArgsFile = [
      '-p',
      '04tXXXXXXXXXXXXXXX',
      '-v',
      testOrg.username,
      '--start-time',
      '2023-01-01T00:00:00Z',
      '--org-list-file',
      'valid-orgs.csv',
    ];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cmd = new PackagePushScheduleCommand(cmdArgsFile, config);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    scheduleStub.resolves(pushReq);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await cmd.run();
    expect(result).to.deep.equal(pushReq);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.log.calledOnce).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(scheduleStub.calledOnce).to.be.true;
  });

  it('should schedule the push upgrade with org input', async () => {
    const cmdArgsOrg = [
      '-p',
      '04tXXXXXXXXXXXXXXX',
      '-v',
      testOrg.username,
      '--start-time',
      '2023-01-01T00:00:00Z',
      '--org-list',
      '00Dxx0000001gEREAY,00Dxx0000001gFAEA0',
    ];
    const cmd = new PackagePushScheduleCommand(cmdArgsOrg, config);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    scheduleStub.resolves(pushReq);
    await cmd.run();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.log.calledOnce).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(scheduleStub.calledOnce).to.be.true;
  });
});
