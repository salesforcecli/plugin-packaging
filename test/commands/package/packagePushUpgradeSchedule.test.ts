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
import * as sinon from 'sinon';
import { expect } from 'chai';
import { PackagePushUpgrade, PackagePushScheduleResult } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { PackagePushScheduleCommand } from '../../../src/commands/package/push-upgrade/schedule.js';

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
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);

    scheduleStub = $$.SANDBOX.stub(PackagePushUpgrade, 'schedule');
  });

  afterEach(() => {
    $$.restore();
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

    scheduleStub.resolves(pushReq);
    await cmd.run();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.log.calledOnce).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(scheduleStub.calledOnce).to.be.true;
  });

  it('should schedule the push migration with --migrate-to-2gp flag', async () => {
    const packageId = '04tXXXXXXXXXXXXXXX';
    const startTime = '2024-01-01T00:00:00Z';
    const orgList = ['00Dxx0000001gEREAY', '00Dxx0000001gFAEA0'];
    const cmdArgs = [
      '--package',
      packageId,
      '--target-dev-hub',
      testOrg.username,
      '--start-time',
      startTime,
      '--org-list',
      orgList.join(','),
      '--migrate-to-2gp', // Add the migration flag
    ];
    const cmd = new PackagePushScheduleCommand(cmdArgs, config);

    scheduleStub.resolves(pushReq);
    const result = await cmd.run();
    expect(result).to.deep.equal(pushReq);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.log.calledOnce).to.be.true;
    expect(scheduleStub.calledOnce).to.be.true;

    // Verify the arguments passed to the schedule function
    const scheduleArgs = scheduleStub.firstCall.args;
    expect(scheduleArgs[1]).to.equal(packageId); // 2nd arg: packageId
    expect(scheduleArgs[2]).to.equal(startTime); // 3rd arg: startTime
    expect(scheduleArgs[3]).to.deep.equal(orgList); // 4th arg: orgList
    expect(scheduleArgs[4]).to.equal(true); // 5th arg: isMigration
  });
});
