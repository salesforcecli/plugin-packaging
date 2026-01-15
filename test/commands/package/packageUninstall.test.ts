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
import os from 'node:os';
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { assert, expect } from 'chai';
import sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { SubscriberPackageVersion } from '@salesforce/packaging';
import { PackageUninstallCommand } from '../../../src/commands/package/uninstall.js';

describe('package:uninstall', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: import.meta.url });

  // stubs
  let logStub: sinon.SinonStub;

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  beforeEach(async () => {
    logStub = $$.SANDBOX.stub(SfCommand.prototype, 'log');
  });

  afterEach(() => {
    $$.restore();
    $$.SANDBOX.restore();
  });

  const libraryStubResult = (status: 'Error' | 'InProgress' | 'Queued' | 'Success'): void => {
    $$.SANDBOX.stub(SubscriberPackageVersion.prototype, 'uninstall').resolves({
      Id: '06y23000000002MXXX',
      IsDeleted: true,
      CreatedDate: 123,
      CreatedById: 'user',
      LastModifiedDate: 123,
      LastModifiedById: '',
      SystemModstamp: 123,
      SubscriberPackageVersionId: '04t4p000002BaHYXXX',
      Status: status,
    });
  };

  it('should print Success status correctly', async () => {
    libraryStubResult('Success');
    const result = await new PackageUninstallCommand(
      ['--package', '04t4p000002BaHYXXX', '-o', testOrg.username],
      config
    ).run();
    expect(result.Status).to.equal('Success');
    expect(logStub.callCount).to.equal(1);
    expect(logStub.firstCall.args[0]).to.equal('Successfully uninstalled package [04t4p000002BaHYXXX]');
  });

  it('should print InProgress status correctly', async () => {
    libraryStubResult('InProgress');
    const result = await new PackageUninstallCommand(
      ['--package', '04t4p000002BaHYXXX', '-o', testOrg.username],
      config
    ).run();
    expect(result.Status).to.equal('InProgress');
    expect(logStub.callCount).to.equal(1);
    expect(logStub.firstCall.args[0]).to.deep.equal(
      `PackageUninstallRequest is currently InProgress.${os.EOL}You can continue to query the status using sf package uninstall report -i 06y23000000002MXXX -o ${testOrg.username}`
    );
  });

  it('should validate --package', async () => {
    libraryStubResult('Success');
    const result = await new PackageUninstallCommand(
      ['--package', '04t4p000002BaHYXXX', '-o', testOrg.username],
      config
    ).run();
    expect(result.Status).to.equal('Success');
    expect(logStub.callCount).to.equal(1);
    expect(logStub.firstCall.args[0]).to.equal('Successfully uninstalled package [04t4p000002BaHYXXX]');
  });

  it("should validate --package (doesn't start with 04t)", async () => {
    try {
      await new PackageUninstallCommand(['--package', '03t4p000002BaHYXXX', '-o', testOrg.username], config).run();
      assert.fail('the above should throw an invalid version error');
    } catch (e) {
      expect((e as Error).message).to.include(
        'Invalid alias or ID: 03t4p000002BaHYXXX. Either your alias is invalid or undefined, or the ID (04t) provided is invalid.'
      );
    }
  });
});
