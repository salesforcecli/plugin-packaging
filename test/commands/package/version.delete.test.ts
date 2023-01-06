/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { resolve } from 'path';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup';
import { stubMethod } from '@salesforce/ts-sinon';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { PackageSaveResult, PackageVersion } from '@salesforce/packaging';
import * as sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { SfProject } from '@salesforce/core';
import { PackageVersionDeleteCommand } from '../../../src/commands/package/version/delete';

describe('force:package:version:delete', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: resolve(__dirname, '../../package.json') });

  const sandbox = sinon.createSandbox();

  // stubs
  let uxSuccessStub: sinon.SinonStub;
  let uxConfirmStub: sinon.SinonStub;

  let packageVersionStub: sinon.SinonStub;
  let deleteStub: sinon.SinonStub;
  let undeleteStub: sinon.SinonStub;

  beforeEach(async () => {
    uxSuccessStub = sandbox.stub(SfCommand.prototype, 'logSuccess');
    uxConfirmStub = stubMethod($$.SANDBOX, SfCommand.prototype, 'confirm');
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
    sandbox.restore();
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
      expect(error.name).to.equal('ErrorInvalidPackageVersionIdError');
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
    expect(uxSuccessStub.args[0][0]).to.equal('Successfully deleted the package version. testId');
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
    expect(uxSuccessStub.args[0][0]).to.equal('Successfully undeleted the package version. testId');
    expect(results.id).to.equal('testId');
  });
});
