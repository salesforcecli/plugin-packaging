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
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { PackageSaveResult, PackageVersion } from '@salesforce/packaging';
import sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { SfProject } from '@salesforce/core';
import { PackageVersionDeleteCommand } from '../../../src/commands/package/version/delete.js';

describe('package:version:delete', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: import.meta.url });

  // stubs
  let uxSuccessStub: sinon.SinonStub;
  let uxConfirmStub: sinon.SinonStub;

  let packageVersionStub: sinon.SinonStub;
  let deleteStub: sinon.SinonStub;
  let undeleteStub: sinon.SinonStub;

  beforeEach(async () => {
    uxSuccessStub = $$.SANDBOX.stub(SfCommand.prototype, 'logSuccess');
    uxConfirmStub = $$.SANDBOX.stub(SfCommand.prototype, 'confirm');
    deleteStub = $$.SANDBOX.stub();
    undeleteStub = $$.SANDBOX.stub();

    // The PackageVersion class is tested in the packaging library, so
    // we just stub the public APIs used by the command.
    packageVersionStub = $$.SANDBOX.stub().callsFake(() => ({
      delete: deleteStub,
      undelete: undeleteStub,
    }));
    Object.setPrototypeOf(PackageVersion, packageVersionStub);
  });

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  afterEach(() => {
    $$.restore();
    $$.SANDBOX.restore();
  });

  beforeEach(() => {});

  it('should error without required --package param', async () => {
    try {
      await new PackageVersionDeleteCommand(['-v', testOrg.username], config).run();
      expect(false, 'Expected required flag error').to.be.true;
    } catch (err) {
      const error = err as Error;
      expect(error.name).to.equal('Error');
      expect(error.message).to.include('Missing required flag package');
    }
  });

  it('should error pkg version alias not found in project', async () => {
    try {
      const command = new PackageVersionDeleteCommand(['-p', 'subscriberPV-alias', '-v', 'foor@bar.org'], config);
      command.project = SfProject.getInstance();
      uxConfirmStub.resolves(true);
      await command.run();

      expect(false, 'Expected invalid id error').to.be.true;
    } catch (err) {
      const error = err as Error;
      expect(error.name).to.equal('PackageAliasNotFoundError');
    }
  });
  it('should delete a package version', async () => {
    deleteStub.reset();
    deleteStub = $$.SANDBOX.stub(PackageVersion.prototype, 'delete').resolves({
      errors: [],
      id: 'testId',
      success: true,
    } as PackageSaveResult);
    uxConfirmStub.resolves(true);

    const command = new PackageVersionDeleteCommand(['-p', '04t6A000002zgKSQAY', '-v', 'foor@bar.org'], config);
    command.project = SfProject.getInstance();
    const results: PackageSaveResult = await command.run();
    expect(results.id).to.equal('testId');
    expect(uxSuccessStub.calledOnce).to.be.true;
    expect(uxSuccessStub.args[0][0]).to.equal('Successfully deleted the package version with ID: testId');
    expect(results.id).to.equal('testId');
  });
  it('should undelete a package version', async () => {
    deleteStub.reset();
    deleteStub = $$.SANDBOX.stub(PackageVersion.prototype, 'undelete').resolves({
      errors: [],
      id: 'testId',
      success: true,
    } as PackageSaveResult);
    uxConfirmStub.resolves(true);
    const command = new PackageVersionDeleteCommand(
      ['-p', '04t6A000002zgKSQAY', '-v', 'foor@bar.org', '--undelete'],
      config
    );
    command.project = SfProject.getInstance();
    const results: PackageSaveResult = await command.run();
    expect(uxSuccessStub.calledOnce).to.be.true;
    expect(uxSuccessStub.args[0][0]).to.equal('Successfully undeleted package version testId.');
    expect(results.id).to.equal('testId');
  });
});
