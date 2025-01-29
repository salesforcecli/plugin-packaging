/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { PackagePushUpgrade } from '@salesforce/packaging';
import { PackagePushUpgradeAbortCommand } from '../../../src/commands/package/pushupgrade/abort.js';

describe('PackagePushUpgradeAbortCommand', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const abortStub = $$.SANDBOX.stub(PackagePushUpgrade, 'abort');
  const config = new Config({ root: import.meta.url });

  const stubSpinner = (cmd: PackagePushUpgradeAbortCommand) => {
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

  it('should successfully abort a push request', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const cmd = new PackagePushUpgradeAbortCommand(['-i', '0DVxx0000004CCG', '-v', 'test@hub.org'], config);
    stubSpinner(cmd);
    const res = await cmd.run();

    expect(res).to.be.false;
    expect(abortStub.calledOnce).to.be.true;
  });

  // it('should handle API failure gracefully', async () => {
  //   parseStub.resolves({
  //     flags: {
  //       'target-dev-hub': { getConnection: () => mockConnection },
  //       'push-request-id': '0DV123456789012345',
  //     },
  //   });

  //   abortStub.rejects(new Error('API Error: Failed to abort'));

  //   command = new PackagePushUpgradeAbortCommand([], {} as any);

  //   try {
  //     await command.run();
  //   } catch (error) {
  //     expect(error.message).to.equal('API Error: Failed to abort');
  //   }

  //   expect(abortStub.calledOnce).to.be.true;
  // });

  // it('should throw an error if push-request-id is missing', async () => {
  //   parseStub.resolves({
  //     flags: {
  //       'target-dev-hub': { getConnection: () => mockConnection },
  //     },
  //   });

  //   command = new PackagePushUpgradeAbortCommand([], {} as any);

  //   try {
  //     await command.run();
  //   } catch (error) {
  //     expect(error.message).to.include("Missing required flag 'push-request-id'");
  //   }
  // });

  // it('should validate that the correct API call is made', async () => {
  //   parseStub.resolves({
  //     flags: {
  //       'target-dev-hub': { getConnection: () => mockConnection },
  //       'push-request-id': '0DV123456789012345',
  //     },
  //   });

  //   abortStub.resolves({
  //     Id: '0DV123456789012345',
  //     Status: 'Canceled',
  //   });

  //   command = new PackagePushUpgradeAbortCommand([], {} as any);
  //   await command.run();

  //   expect(abortStub.calledOnceWith(mockConnection, { packagePushRequestId: '0DV123456789012345' })).to.be.true;
  // });

  // it('should handle already canceled push requests', async () => {
  //   parseStub.resolves({
  //     flags: {
  //       'target-dev-hub': { getConnection: () => mockConnection },
  //       'push-request-id': '0DV123456789012345',
  //     },
  //   });

  //   abortStub.resolves({
  //     Id: '0DV123456789012345',
  //     Status: 'Canceled',
  //   });

  //   command = new PackagePushUpgradeAbortCommand([], {} as any);
  //   const result = await command.run();

  //   expect(result).to.be.false;
  //   expect(logStub.calledWithMatch('Push request 0DV123456789012345 has already been canceled.')).to.be.true;
  // });
});
