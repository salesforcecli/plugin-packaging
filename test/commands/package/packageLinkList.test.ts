/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or authorized to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Config } from '@oclif/core';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { PackageTrustLink, PackageTrustLinkRecord } from '@salesforce/packaging';
import { PackageLinkListCommand } from '../../../src/commands/package/link/list.js';

const linkListSuccess: PackageTrustLinkRecord[] = [
  {
    Id: '2vt000000000001AAA',
    AuthoringOrg: '00D000000000002',
    VerifiedOrg: '00D000000000001',
    Status: 'Pending',
    RequestedBy: 'Ada Lovelace',
    CreatedDate: '2026-08-24T00:00:00.000Z',
    EstablishedDate: null,
    RevokedDate: null,
  },
];

describe('package:link:list - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let listStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    listStub = $$.SANDBOX.stub(PackageTrustLink, 'list').resolves(linkListSuccess);
  });

  afterEach(() => {
    $$.restore();
  });

  it('lists inbound Public Secure link requests', async () => {
    const cmd = new PackageLinkListCommand(['-o', testOrg.username, '--api-version', '68.0'], config);
    const result = await cmd.run();

    expect(result).to.deep.equal(linkListSuccess);
    expect(listStub.calledOnce).to.equal(true);
    expect(listStub.firstCall.args[1]).to.equal(undefined);
    expect(sfCommandStubs.table.called).to.equal(true);
  });

  it('passes the status filter to PackageTrustLink.list', async () => {
    const cmd = new PackageLinkListCommand(
      ['-o', testOrg.username, '--api-version', '68.0', '--status', 'pending'],
      config
    );
    await cmd.run();
    expect(listStub.calledOnce).to.equal(true);
    expect(listStub.firstCall.args[1]).to.equal('pending');
  });

  it('warns when there are no results', async () => {
    listStub.resolves([]);
    const cmd = new PackageLinkListCommand(['-o', testOrg.username, '--api-version', '68.0'], config);
    const result = await cmd.run();
    expect(result).to.deep.equal([]);
    expect(sfCommandStubs.warn.called).to.equal(true);
  });
});
