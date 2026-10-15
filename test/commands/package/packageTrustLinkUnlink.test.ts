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
import { PackageTrustLink, PackageTrustLinkUnlinkResult } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { PackageTrustLinkUnlinkCommand } from '../../../src/commands/package/trust/link/unlink.js';

const verifiedOrgId = '00Dxx0000001gPL';
const removedResult: PackageTrustLinkUnlinkResult = {
  removed: true,
  LinkRequestId: '2vtxx0000000001AAA',
  VerifiedOrgId: verifiedOrgId,
  Status: 'Pending',
};

describe('package:trust:link:unlink - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let unlinkStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    unlinkStub = $$.SANDBOX.stub(PackageTrustLink, 'unlink');
  });

  afterEach(() => {
    $$.restore();
  });

  it('removes the trust link and returns the result', async () => {
    const cmdArgs = ['--target-org', testOrg.username];
    const cmd = new PackageTrustLinkUnlinkCommand(cmdArgs, config);

    unlinkStub.resolves(removedResult);
    const result = await cmd.run();

    expect(result).to.deep.equal(removedResult);
    expect(unlinkStub.calledOnce).to.be.true;
    expect(sfCommandStubs.log.calledOnce).to.be.true;
    const logged = sfCommandStubs.log.firstCall.args[0];
    expect(logged).to.contain(verifiedOrgId);
    expect(logged).to.contain('Pending');
  });

  it('reports the already Not Linked state when nothing was removed', async () => {
    const cmdArgs = ['-o', testOrg.username];
    const cmd = new PackageTrustLinkUnlinkCommand(cmdArgs, config);

    unlinkStub.resolves({ removed: false });
    const result = await cmd.run();

    expect(result).to.deep.equal({ removed: false });
    expect(sfCommandStubs.log.calledOnce).to.be.true;
    expect(sfCommandStubs.log.firstCall.args[0]).to.contain('Not Linked');
  });

  it('surfaces errors thrown by the library', async () => {
    const cmdArgs = ['--target-org', testOrg.username];
    const cmd = new PackageTrustLinkUnlinkCommand(cmdArgs, config);

    unlinkStub.rejects(new Error('INSUFFICIENT_ACCESS'));

    try {
      await cmd.run();
      expect.fail('expected the library error to propagate');
    } catch (err) {
      expect((err as Error).message).to.contain('INSUFFICIENT_ACCESS');
    }
    expect(sfCommandStubs.log.called).to.be.false;
  });
});
