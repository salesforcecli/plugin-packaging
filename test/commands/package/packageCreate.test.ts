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
import { Package, PackageCreateOptions } from '@salesforce/packaging';
import sinon from 'sinon';
import { PackageCreateCommand } from '../../../src/commands/package/create.js';

describe('package:create', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: import.meta.url });

  let createStub: sinon.SinonStub;

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  beforeEach(() => {
    $$.SANDBOX.stub(PackageCreateCommand.prototype, 'table');
    createStub = $$.SANDBOX.stub(Package, 'create').resolves({ Id: '0Ho000000000001AAA' });
  });

  afterEach(() => {
    $$.restore();
    $$.SANDBOX.restore();
  });

  it('passes the distribution type through to the library when provided', async () => {
    const cmd = new PackageCreateCommand(
      [
        '--name',
        'MyPkg',
        '--package-type',
        'Managed',
        '--path',
        'force-app',
        '--distribution-type',
        'Limited',
        '-v',
        testOrg.username,
      ],
      config
    );
    await cmd.run();
    const options = createStub.getCall(0).args[2] as PackageCreateOptions;
    expect(options.distributionType).to.equal('Limited');
  });

  it('leaves the distribution type undefined when the flag is omitted', async () => {
    const cmd = new PackageCreateCommand(
      ['--name', 'MyPkg', '--package-type', 'Managed', '--path', 'force-app', '-v', testOrg.username],
      config
    );
    await cmd.run();
    const options = createStub.getCall(0).args[2] as PackageCreateOptions;
    expect(options.distributionType).to.equal(undefined);
  });

  it('rejects a distribution type that is not CLI-settable', async () => {
    try {
      const cmd = new PackageCreateCommand(
        [
          '--name',
          'MyPkg',
          '--package-type',
          'Managed',
          '--path',
          'force-app',
          '--distribution-type',
          'Public',
          '-v',
          testOrg.username,
        ],
        config
      );
      await cmd.run();
      expect.fail('Expected an invalid-flag-value error');
    } catch (e) {
      expect((e as Error).message).to.include('PublicSecure').and.to.include('Limited');
      expect(createStub.called).to.equal(false);
    }
  });
});
