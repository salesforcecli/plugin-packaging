/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { PackagePushRequestListResult, PackagePushUpgrade } from '@salesforce/packaging';
import { env } from '@salesforce/kit';
import { PackagePushRequestListCommand } from '../../../src/commands/package/pushupgrade/list.js';

const pushUpgradeListSuccess: PackagePushRequestListResult[] = [
  {
    Id: '0Af0M000000AxuqSAC',
    PackageVersionId: '04t0M000000AxuqSAC',
    Status: 'Success',
    ScheduledDateTime: '2024-01-02T00:00:00.000Z',
    StartTime: '2024-01-02T00:01:00.000Z',
    EndTime: '2024-01-02T00:10:00.000Z',
    NumOrgsScheduled: 2,
    NumOrgsUpgradedFail: 0,
    NumOrgsUpgradedSuccess: 2,
  },
];

describe('package:pushupgrade:list - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const createStub = $$.SANDBOX.stub(PackagePushUpgrade, 'list');
  const config = new Config({ root: import.meta.url });

  const stubSpinner = (cmd: PackagePushRequestListCommand) => {
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

  it('should list push upgrade requests', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    createStub.resolves(pushUpgradeListSuccess);
    const envSpy = $$.SANDBOX.spy(env, 'setBoolean').withArgs('SF_APPLY_REPLACEMENTS_ON_CONVERT', true);

    const cmd = new PackagePushRequestListCommand(['-p', '033xi000000Gmj6XXX', '-v', 'test@hub.org'], config);
    stubSpinner(cmd);
    const res = await cmd.run();
    expect(envSpy.calledOnce).to.equal(false);
    expect(res).to.eql(pushUpgradeListSuccess);
  });

  it('should fail to list push upgrade requests', async () => {
    createStub.rejects(new Error('Failed to list push upgrade requests'));
    const envSpy = $$.SANDBOX.spy(env, 'setBoolean').withArgs('SF_APPLY_REPLACEMENTS_ON_CONVERT', true);

    const cmd = new PackagePushRequestListCommand(['-p', '033xi000000Gmj6XXX', '-v', 'test@hub.org'], config);
    stubSpinner(cmd);

    try {
      await cmd.run();
      throw new Error('Failed to list push upgrade requests');
    } catch (error) {
      expect((error as Error).message).to.equal('Failed to list push upgrade requests');
      expect(envSpy.calledOnce).to.equal(false);
    }
  });
});
