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
import { PackageTrustLink, PackageTrustLinkRequestResult } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { PackageTrustLinkRequestCommand } from '../../../src/commands/package/trust/link/request.js';

const verifiedOrgId = '00Dxx0000001gPLEAY';
const linkResult: PackageTrustLinkRequestResult = {
  LinkRequestId: '2vtxx0000000001AAA',
  VerifiedOrgId: verifiedOrgId,
  Status: 'Pending',
};

describe('package:trust:link:request - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let requestStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    requestStub = $$.SANDBOX.stub(PackageTrustLink, 'request');
  });

  afterEach(() => {
    $$.restore();
  });

  it('requests a trust link and returns the result', async () => {
    const cmdArgs = ['--verified-org', verifiedOrgId, '--target-org', testOrg.username];
    const cmd = new PackageTrustLinkRequestCommand(cmdArgs, config);

    requestStub.resolves(linkResult);
    const result = await cmd.run();

    expect(result).to.deep.equal(linkResult);
    expect(sfCommandStubs.log.calledOnce).to.be.true;
    expect(requestStub.calledOnce).to.be.true;
  });

  it('passes the verified org ID through to the library', async () => {
    const cmdArgs = ['-i', verifiedOrgId, '-o', testOrg.username];
    const cmd = new PackageTrustLinkRequestCommand(cmdArgs, config);

    requestStub.resolves(linkResult);
    await cmd.run();

    const requestArgs = requestStub.firstCall.args;
    // 1st arg: connection, 2nd arg: options
    expect(requestArgs[1]).to.deep.equal({ verifiedOrgId });
  });

  it('logs the output message with the verified org ID and trust link ID', async () => {
    const cmdArgs = ['--verified-org', verifiedOrgId, '--target-org', testOrg.username];
    const cmd = new PackageTrustLinkRequestCommand(cmdArgs, config);

    requestStub.resolves(linkResult);
    await cmd.run();

    expect(sfCommandStubs.log.calledOnce).to.be.true;
    const logged = sfCommandStubs.log.firstCall.args[0];
    expect(logged).to.contain(linkResult.VerifiedOrgId);
    expect(logged).to.contain(linkResult.LinkRequestId);
  });

  it('surfaces errors thrown by the library', async () => {
    const cmdArgs = ['--verified-org', verifiedOrgId, '--target-org', testOrg.username];
    const cmd = new PackageTrustLinkRequestCommand(cmdArgs, config);

    requestStub.rejects(new Error('This org already has a trust link'));

    try {
      await cmd.run();
      expect.fail('expected the library error to propagate');
    } catch (err) {
      expect((err as Error).message).to.contain('already has a trust link');
    }
    expect(sfCommandStubs.log.called).to.be.false;
  });

  it('fails when --verified-org is not a valid org ID', async () => {
    const cmdArgs = ['--verified-org', 'not-an-org', '--target-org', testOrg.username];
    const cmd = new PackageTrustLinkRequestCommand(cmdArgs, config);

    try {
      await cmd.run();
      expect.fail('expected the command to reject an invalid org ID');
    } catch (err) {
      expect(err).to.be.instanceOf(Error);
    }
    expect(requestStub.called).to.be.false;
  });
});
