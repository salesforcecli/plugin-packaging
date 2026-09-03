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
import { expect } from 'chai';
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { Package, PackageUpdateOptions } from '@salesforce/packaging';
import sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { PackageUpdateCommand } from '../../../src/commands/package/update.js';

describe('package:update', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: import.meta.url });

  const pkgId = '0Ho000000000001AAA';
  let updateStub: sinon.SinonStub;

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  beforeEach(() => {
    $$.SANDBOX.stub(SfCommand.prototype, 'logSuccess');
    // The Package class is tested in the packaging library; stub the public API the command uses.
    // A raw 0Ho id skips project alias resolution in the constructor, so only these need stubbing.
    $$.SANDBOX.stub(Package.prototype, 'getId').returns(pkgId);
    updateStub = $$.SANDBOX.stub(Package.prototype, 'update').resolves({ success: true, id: pkgId, errors: [] });
  });

  afterEach(() => {
    $$.restore();
    $$.SANDBOX.restore();
  });

  it('passes the distribution type through to the library when provided', async () => {
    const cmd = new PackageUpdateCommand(
      ['--package', pkgId, '--distribution-type', 'PublicSecure', '-v', testOrg.username],
      config
    );
    await cmd.run();
    const options = updateStub.getCall(0).args[0] as PackageUpdateOptions;
    expect(options.DistributionType).to.equal('PublicSecure');
  });

  it('leaves the distribution type undefined when the flag is omitted', async () => {
    const cmd = new PackageUpdateCommand(['--package', pkgId, '--name', 'NewName', '-v', testOrg.username], config);
    await cmd.run();
    const options = updateStub.getCall(0).args[0] as PackageUpdateOptions;
    expect(options.DistributionType).to.equal(undefined);
  });

  it('rejects a distribution type that is not CLI-settable', async () => {
    try {
      const cmd = new PackageUpdateCommand(
        ['--package', pkgId, '--distribution-type', 'Public', '-v', testOrg.username],
        config
      );
      await cmd.run();
      expect.fail('Expected an invalid-flag-value error');
    } catch (e) {
      expect((e as Error).message).to.include('PublicSecure').and.to.include('Limited');
      expect(updateStub.called).to.equal(false);
    }
  });
});
