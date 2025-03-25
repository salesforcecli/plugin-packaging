/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from 'node:fs';
import { expect } from 'chai';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { PackagePushUpgrade, PackagePushScheduleResult } from '@salesforce/packaging';
import { PackagePushScheduleCommand } from '../../../src/commands/package/pushupgrade/schedule.js';

describe('package:pushupgrade:schedule - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const scheduleStub = $$.SANDBOX.stub(PackagePushUpgrade, 'schedule');
  const config = new Config({ root: import.meta.url });

  const stubSpinner = (cmd: PackagePushScheduleCommand) => {
    $$.SANDBOX.stub(cmd.spinner, 'start');
    $$.SANDBOX.stub(cmd.spinner, 'stop');
  };

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();

    // Create actual file
    fs.writeFileSync('valid-orgs.csv', '00D000000000001');
  });

  afterEach(() => {
    $$.restore();
    if (fs.existsSync('valid-orgs.csv')) {
      fs.unlinkSync('valid-orgs.csv');
    }
  });

  it('should successfully schedule a push upgrade', async () => {
    const mockResult: PackagePushScheduleResult = {
      PushRequestId: 'mockPushJobId',
      ScheduledStartTime: '2023-01-01T00:00:00Z',
      Status: 'Scheduled',
    };

    scheduleStub.resolves(mockResult);

    const cmd = new PackagePushScheduleCommand(
      [
        '-p',
        '04tXXXXXXXXXXXXXXX',
        '-v',
        'test@hub.org',
        '--start-time',
        '2023-01-01T00:00:00Z',
        '--org-list',
        'valid-orgs.csv',
      ],
      config
    );

    stubSpinner(cmd);

    const res = await cmd.run();
    expect(res).to.eql(mockResult);
    expect(scheduleStub.calledOnce).to.be.true;
  });

  it('should fail to schedule push upgrade', async () => {
    const cmd = new PackagePushScheduleCommand(
      [
        '-p',
        '04tXXXXXXXXXXXXXXX',
        '-v',
        'test@hub.org',
        '--start-time',
        '2023-01-01T00:00:00Z',
        '--org-list',
        'valid-orgs.csv',
      ],
      config
    );

    stubSpinner(cmd);

    try {
      await cmd.run();
      expect.fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
    }
  });
});
