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
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Config } from '@oclif/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Package, PackageAuthorization } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import sinon from 'sinon';
import { PackageAuthorizeAddCommand } from '../../../../src/commands/package/authorize/add.js';

const subscriberOrg = '00D000000000001';
const secondSubscriberOrg = '00D000000000002';
const packageId = '0Ho000000000001';
const subscriberPackageId = '033000000000001';

describe('package:authorize:add', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: import.meta.url });
  let addStub: sinon.SinonStub;
  let getSubscriberPackageIdStub: sinon.SinonStub;
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let tempDirectory: string | undefined;

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    addStub = $$.SANDBOX.stub(PackageAuthorization.prototype, 'add');
    getSubscriberPackageIdStub = $$.SANDBOX.stub(Package.prototype, 'getSubscriberPackageId');
  });

  afterEach(async () => {
    $$.restore();
    if (tempDirectory) {
      await rm(tempDirectory, { recursive: true, force: true });
      tempDirectory = undefined;
    }
  });

  it('adds comma-separated subscriber orgs without a package', async () => {
    const expectedResults = [
      { Id: '2at000000000001', SubscriberOrg: subscriberOrg },
      { Id: '2at000000000002', SubscriberOrg: secondSubscriberOrg },
    ];
    addStub.resolves(expectedResults);
    const command = new PackageAuthorizeAddCommand(
      [
        '--target-org',
        testOrg.username,
        '--api-version',
        '68.0',
        '--subscriber-org',
        `${subscriberOrg}, ${secondSubscriberOrg}`,
      ],
      config
    );

    const result = await command.run();

    expect(result).to.deep.equal(expectedResults);
    expect(addStub.calledOnceWithExactly([subscriberOrg, secondSubscriberOrg])).to.equal(true);
    expect(getSubscriberPackageIdStub.called).to.equal(false);
    expect((addStub.thisValues[0] as unknown as { subscriberPackageId?: string }).subscriberPackageId).to.equal(
      undefined
    );
    expect(sfCommandStubs.table.firstCall.args[0].data).to.deep.equal(expectedResults);
    expect(sfCommandStubs.logSuccess.calledOnceWithExactly('Successfully authorized 2 subscriber org(s).')).to.equal(
      true
    );
  });

  it('resolves a package before adding subscriber orgs', async () => {
    getSubscriberPackageIdStub.resolves(subscriberPackageId);
    addStub.resolves([{ Id: '2at000000000001', SubscriberOrg: subscriberOrg }]);
    const command = new PackageAuthorizeAddCommand(
      [
        '--target-org',
        testOrg.username,
        '--api-version',
        '68.0',
        '--package',
        packageId,
        '--subscriber-org',
        subscriberOrg,
      ],
      config
    );

    await command.run();

    expect(getSubscriberPackageIdStub.calledOnce).to.equal(true);
    expect((addStub.thisValues[0] as unknown as { subscriberPackageId?: string }).subscriberPackageId).to.equal(
      subscriberPackageId
    );
    expect(addStub.calledOnceWithExactly([subscriberOrg])).to.equal(true);
  });

  it('adds subscriber orgs from a file', async () => {
    tempDirectory = await mkdtemp(join(tmpdir(), 'package-authorize-add-'));
    const subscriberOrgFile = join(tempDirectory, 'subscriber-orgs.txt');
    await writeFile(
      subscriberOrgFile,
      `${subscriberOrg} # Customer A\n\n# comment\n${secondSubscriberOrg} # Customer B\n`,
      'utf8'
    );
    addStub.resolves([
      { Id: '2at000000000001', SubscriberOrg: subscriberOrg },
      { Id: '2at000000000002', SubscriberOrg: secondSubscriberOrg },
    ]);
    const command = new PackageAuthorizeAddCommand(
      ['--target-org', testOrg.username, '--api-version', '68.0', '--subscriber-org-file-list', subscriberOrgFile],
      config
    );

    await command.run();

    expect(addStub.calledOnceWithExactly([subscriberOrg, secondSubscriberOrg])).to.equal(true);
  });

  it('rejects a subscriber org file with no IDs', async () => {
    tempDirectory = await mkdtemp(join(tmpdir(), 'package-authorize-add-'));
    const subscriberOrgFile = join(tempDirectory, 'subscriber-orgs.txt');
    await writeFile(subscriberOrgFile, '# no subscriber orgs\n\n', 'utf8');
    const command = new PackageAuthorizeAddCommand(
      ['--target-org', testOrg.username, '--api-version', '68.0', '--subscriber-org-file-list', subscriberOrgFile],
      config
    );

    try {
      await command.run();
      expect.fail('Expected a missing subscriber org error');
    } catch (error) {
      expect((error as Error).message).to.equal('Provide at least one subscriber org ID.');
    }
    expect(addStub.called).to.equal(false);
  });

  it('propagates authorization errors without success output', async () => {
    const authorizationError = new Error('Tooling API create failed');
    addStub.rejects(authorizationError);
    const command = new PackageAuthorizeAddCommand(
      ['--target-org', testOrg.username, '--api-version', '68.0', '--subscriber-org', subscriberOrg],
      config
    );

    try {
      await command.run();
      expect.fail('Expected the authorization error');
    } catch (error) {
      expect(error).to.equal(authorizationError);
    }
    expect(sfCommandStubs.table.called).to.equal(false);
    expect(sfCommandStubs.logSuccess.called).to.equal(false);
  });
});
