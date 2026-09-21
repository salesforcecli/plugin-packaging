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
import { Package, PackageAuthorization } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import sinon from 'sinon';
import { PackageAuthorizeRemoveCommand } from '../../../../src/commands/package/authorize/remove.js';

const subscriberOrg = '00D000000000001';
const packageId = '0Ho000000000001';
const subscriberPackageId = '033000000000001';

describe('package:authorize:remove', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: import.meta.url });
  let getSubscriberPackageIdStub: sinon.SinonStub;
  let removeStub: sinon.SinonStub;
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    getSubscriberPackageIdStub = $$.SANDBOX.stub(Package.prototype, 'getSubscriberPackageId');
    removeStub = $$.SANDBOX.stub(PackageAuthorization.prototype, 'remove');
  });

  afterEach(() => {
    $$.restore();
  });

  it('removes an authorization without a package', async () => {
    const expectedResult = { SubscriberOrg: subscriberOrg, removed: true };
    removeStub.resolves(expectedResult);
    const command = new PackageAuthorizeRemoveCommand(
      ['--target-org', testOrg.username, '--api-version', '68.0', '--subscriber-org', subscriberOrg],
      config
    );

    const result = await command.run();

    expect(result).to.deep.equal(expectedResult);
    expect(removeStub.calledOnceWithExactly(subscriberOrg)).to.equal(true);
    expect(getSubscriberPackageIdStub.called).to.equal(false);
    expect((removeStub.thisValues[0] as unknown as { subscriberPackageId?: string }).subscriberPackageId).to.equal(
      undefined
    );
    expect(
      sfCommandStubs.logSuccess.calledOnceWithExactly(
        `Successfully removed the authorization for subscriber org ${subscriberOrg}.`
      )
    ).to.equal(true);
    expect(sfCommandStubs.log.called).to.equal(false);
  });

  it('resolves a package before removing an authorization', async () => {
    getSubscriberPackageIdStub.resolves(subscriberPackageId);
    removeStub.resolves({ SubscriberOrg: subscriberOrg, removed: true });
    const command = new PackageAuthorizeRemoveCommand(
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
    expect((removeStub.thisValues[0] as unknown as { subscriberPackageId?: string }).subscriberPackageId).to.equal(
      subscriberPackageId
    );
    expect(removeStub.calledOnceWithExactly(subscriberOrg)).to.equal(true);
  });

  it('reports when no matching authorization is found', async () => {
    removeStub.resolves({ SubscriberOrg: subscriberOrg, removed: false });
    const command = new PackageAuthorizeRemoveCommand(
      ['--target-org', testOrg.username, '--api-version', '68.0', '--subscriber-org', subscriberOrg],
      config
    );

    const result = await command.run();

    expect(result).to.deep.equal({ SubscriberOrg: subscriberOrg, removed: false });
    expect(
      sfCommandStubs.log.calledOnceWithExactly(`No authorization for subscriber org ${subscriberOrg} was found.`)
    ).to.equal(true);
    expect(sfCommandStubs.logSuccess.called).to.equal(false);
  });

  it('propagates authorization errors without output', async () => {
    const authorizationError = new Error('Tooling API delete failed');
    removeStub.rejects(authorizationError);
    const command = new PackageAuthorizeRemoveCommand(
      ['--target-org', testOrg.username, '--api-version', '68.0', '--subscriber-org', subscriberOrg],
      config
    );

    try {
      await command.run();
      expect.fail('Expected the authorization error');
    } catch (error) {
      expect(error).to.equal(authorizationError);
    }
    expect(sfCommandStubs.log.called).to.equal(false);
    expect(sfCommandStubs.logSuccess.called).to.equal(false);
  });
});
