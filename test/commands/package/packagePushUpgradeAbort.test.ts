/*
 * Copyright 2025, Salesforce, Inc.
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
import { expect } from 'chai';
import { PackagePushUpgrade } from '@salesforce/packaging';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { PackagePushUpgradeAbortCommand } from '../../../src/commands/package/push-upgrade/abort.js';

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

    abortStub.resolves(true);
    const res = await cmd.run();

    expect(res.success).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(abortStub.calledOnce).to.be.true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(logStub.callCount).to.equal(1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(logStub.args[0]).to.deep.equal([`Scheduled push upgrade ID [${pushRequestId}] was cancelled.`]);
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
