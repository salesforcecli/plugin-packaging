/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import sinon from 'sinon';
import { PackagePushUpgrade } from '@salesforce/packaging';
import { PackagePushUpgradeAbortCommand } from '../../../src/commands/package/pushupgrade/abort.js';

describe('PackagePushUpgradeAbortCommand', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const abortStub = $$.SANDBOX.stub(PackagePushUpgrade, 'abort');
  const config = new Config({ root: import.meta.url });

  // stubs
  let logStub: sinon.SinonStub;

  const stubSpinner = (cmd: PackagePushUpgradeAbortCommand) => {
    $$.SANDBOX.stub(cmd.spinner, 'start');
    $$.SANDBOX.stub(cmd.spinner, 'stop');
  };

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  beforeEach(async () => {
    logStub = $$.SANDBOX.stub(SfCommand.prototype, 'log');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should successfully abort a push request', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const cmd = new PackagePushUpgradeAbortCommand(['-i', '0DVxx0000004CCG', '-v', 'test@hub.org'], config);
    stubSpinner(cmd);
    const res = await cmd.run();

    expect(res).to.be.true;
    expect(abortStub.calledOnce).to.be.true;
    expect(logStub.callCount).to.equal(1);
    expect(logStub.args[0]).to.deep.equal(['Scheduled push upgrade ID 0DVxx0000004CCG was canceled.']);
  });

  it('should throw an error if push-request-id is missing', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const cmd = new PackagePushUpgradeAbortCommand(['-v', 'test@hub.org'], config);
    stubSpinner(cmd);

    try {
      await cmd.run();
    } catch (err) {
      const error = err as Error;
      expect(error.name).to.equal('Error');
      expect(error.message).to.include('Missing required flag push-request-id');
    }
  });

  it('should throw an error if push-request status is not "Created" or "Pending" or  is missing', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    abortStub.rejects(new Error('Abortion is only allowed for "Created" or "Pending" statuses.'));
    const cmd = new PackagePushUpgradeAbortCommand(['-i', '0DVxx0000004CCG', '-v', 'test@hub.org'], config);
    stubSpinner(cmd);

    try {
      await cmd.run();
    } catch (err) {
      const error = err as Error;
      const msg = 'Abortion is only allowed for "Created" or "Pending" statuses.';
      expect(error.name).to.equal('Error');
      expect(error.message).to.include(msg);
    }
  });
});
