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
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { PackageTrustLink, PackageTrustLinkApproveResult } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PackageTrustLinkApproveCommand } from '../../../src/commands/package/trust/link/approve.js';

const requestId = '2vtxx0000000001AAA';
const authoringOrgId = '00Dxx0000009zZZEAY';
const approveResult: PackageTrustLinkApproveResult = {
  LinkRequestId: requestId,
  AuthoringOrgId: authoringOrgId,
  VerifiedOrgId: '00Dxx0000001gPLEAY',
  Status: 'Accepted',
};

describe('package:trust:link:approve - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: import.meta.url });
  let approveStub: sinon.SinonStub;
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    approveStub = $$.SANDBOX.stub(PackageTrustLink, 'approve').resolves(approveResult);
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  it('approves a trust link selected by request ID', async () => {
    const command = new PackageTrustLinkApproveCommand(
      ['--request', requestId, '--target-org', testOrg.username, '--api-version', '68.0'],
      config
    );

    const result = await command.run();

    expect(result).to.deep.equal(approveResult);
    expect(approveStub.firstCall.args[1]).to.deep.equal({ requestId });
    expect(sfCommandStubs.log.firstCall.args[0]).to.contain(requestId);
  });

  it('approves a trust link selected by authoring org', async () => {
    const command = new PackageTrustLinkApproveCommand(
      ['--authoring-org', authoringOrgId, '--target-org', testOrg.username],
      config
    );

    await command.run();

    expect(approveStub.firstCall.args[1]).to.deep.equal({ authoringOrgId });
  });

  it('requires a selector', async () => {
    const command = new PackageTrustLinkApproveCommand(['--target-org', testOrg.username], config);
    try {
      await command.run();
      expect.fail('expected exactly-one flag validation to fail');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
    }
    expect(approveStub.called).to.equal(false);
  });

  it('rejects multiple selectors', async () => {
    const command = new PackageTrustLinkApproveCommand(
      ['--request', requestId, '--authoring-org', authoringOrgId, '--target-org', testOrg.username],
      config
    );
    try {
      await command.run();
      expect.fail('expected exactly-one flag validation to fail');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
    }
    expect(approveStub.called).to.equal(false);
  });

  it('rejects an invalid authoring org ID before calling the library', async () => {
    const command = new PackageTrustLinkApproveCommand(
      ['--authoring-org', 'not-an-org', '--target-org', testOrg.username],
      config
    );

    try {
      await command.run();
      expect.fail('expected invalid org ID validation to fail');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
    }
    expect(approveStub.called).to.equal(false);
  });

  it('rejects a request ID with the wrong entity prefix before calling the library', async () => {
    const command = new PackageTrustLinkApproveCommand(
      ['--request', authoringOrgId, '--target-org', testOrg.username],
      config
    );

    try {
      await command.run();
      expect.fail('expected invalid request ID validation to fail');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
    }
    expect(approveStub.called).to.equal(false);
  });
});
