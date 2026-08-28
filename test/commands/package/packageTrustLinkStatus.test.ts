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
import { PackageTrustLink, PackageTrustLinkStatusResult } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { PackageTrustLinkStatusCommand } from '../../../src/commands/package/trust/link/status.js';

const verifiedOrgId = '00Dxx0000001gPL';
const linkedResult: PackageTrustLinkStatusResult = {
  Status: 'Accepted',
  linked: true,
  LinkRequestId: '2vtxx0000000001AAA',
  VerifiedOrgId: verifiedOrgId,
  RequestedDate: '2026-08-19T09:00:00.000+0000',
  EstablishedDate: '2026-08-20T10:00:00.000+0000',
};

describe('package:trust:link:status - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let statusStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    statusStub = $$.SANDBOX.stub(PackageTrustLink, 'status');
  });

  afterEach(() => {
    $$.restore();
  });

  it('reports an existing link and returns the result', async () => {
    const cmdArgs = ['--target-org', testOrg.username];
    const cmd = new PackageTrustLinkStatusCommand(cmdArgs, config);

    statusStub.resolves(linkedResult);
    const result = await cmd.run();

    expect(result).to.deep.equal(linkedResult);
    expect(statusStub.calledOnce).to.be.true;
    // status line + requested + established timestamps
    expect(sfCommandStubs.log.callCount).to.equal(3);
    const statusLine = sfCommandStubs.log.firstCall.args[0];
    expect(statusLine).to.contain('Accepted');
    expect(statusLine).to.contain(verifiedOrgId);
  });

  it('reports the Not Linked state when the org has no link', async () => {
    const cmdArgs = ['-o', testOrg.username];
    const cmd = new PackageTrustLinkStatusCommand(cmdArgs, config);

    const notLinked: PackageTrustLinkStatusResult = { Status: 'Not Linked', linked: false };
    statusStub.resolves(notLinked);
    const result = await cmd.run();

    expect(result).to.deep.equal(notLinked);
    expect(sfCommandStubs.log.calledOnce).to.be.true;
    expect(sfCommandStubs.log.firstCall.args[0]).to.contain('Not Linked');
  });

  it('logs only the timestamps that are set (Pending link, no established/revoked)', async () => {
    const cmdArgs = ['--target-org', testOrg.username];
    const cmd = new PackageTrustLinkStatusCommand(cmdArgs, config);

    statusStub.resolves({
      Status: 'Pending',
      linked: true,
      LinkRequestId: '2vtxx0000000001AAA',
      VerifiedOrgId: verifiedOrgId,
      RequestedDate: '2026-08-19T09:00:00.000+0000',
    } satisfies PackageTrustLinkStatusResult);
    await cmd.run();

    // status line + requested only — no established, no revoked
    expect(sfCommandStubs.log.callCount).to.equal(2);
    const lines = sfCommandStubs.log.getCalls().map((c) => c.args[0] as string);
    expect(lines.some((l) => l.includes('Pending'))).to.be.true;
    expect(lines.some((l) => l.includes('2026-08-19'))).to.be.true;
  });

  it('surfaces errors thrown by the library', async () => {
    const cmdArgs = ['--target-org', testOrg.username];
    const cmd = new PackageTrustLinkStatusCommand(cmdArgs, config);

    statusStub.rejects(new Error('INSUFFICIENT_ACCESS'));

    try {
      await cmd.run();
      expect.fail('expected the library error to propagate');
    } catch (err) {
      expect((err as Error).message).to.contain('INSUFFICIENT_ACCESS');
    }
    expect(sfCommandStubs.log.called).to.be.false;
  });
});
