/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Config } from '@oclif/core';
import { TestContext, MockTestOrgData, sinon } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { PackagePushUpgrade } from '@salesforce/packaging';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { PackagePushUpgradeAbortCommand } from '../../../src/commands/package/pushupgrade/abort.js';

describe('PackagePushUpgradeAbortCommand', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let logStub: sinon.SinonStub;
  let abortStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    logStub = $$.SANDBOX.stub(SfCommand.prototype, 'log');
    abortStub = $$.SANDBOX.stub(PackagePushUpgrade, 'abort');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should pass the right parameters to the library', async () => {
    const pushRequestId = '0DVxx0000004CCG';
    const cmd = new PackagePushUpgradeAbortCommand(['-i', pushRequestId, '-v', testOrg.username], config);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    abortStub.resolves(true);
    const res = await cmd.run();

    expect(res).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(abortStub.calledOnce).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(logStub.callCount).to.equal(1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(logStub.args[0]).to.deep.equal([`Scheduled push upgrade ID ${pushRequestId} was canceled.`]);
  });

  it('should throw an error if push-request-id is missing', async () => {
    const cmd = new PackagePushUpgradeAbortCommand(['-v', 'test@hub.org'], config);
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
