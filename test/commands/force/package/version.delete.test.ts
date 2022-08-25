/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Org } from '@salesforce/core';
import { testSetup } from '@salesforce/core/lib/testSetup';
import { fromStub, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { PackageSaveResult, PackageVersion } from '@salesforce/packaging';
import { Result } from '@salesforce/command';
import { PackageVersionDeleteCommand } from '../../../../src/commands/force/package/beta/version/delete';

const $$ = testSetup();
const oclifConfigStub = fromStub(stubInterface<Config>($$.SANDBOX));
let uxLogStub: sinon.SinonStub;
let uxConfirmStub: sinon.SinonStub;
let apiVersionStub: sinon.SinonStub;
let queryStub: sinon.SinonStub;
let packageVersionStub: sinon.SinonStub;
let deleteStub: sinon.SinonStub;
let undeleteStub: sinon.SinonStub;

class TestCommand extends PackageVersionDeleteCommand {
  public async runIt(confirm: boolean) {
    this.result = new Result(this.statics.result);
    await this.init();
    uxLogStub = stubMethod($$.SANDBOX, this.ux, 'log');
    uxConfirmStub = stubMethod($$.SANDBOX, this.ux, 'confirm');
    if (confirm) {
      uxConfirmStub.resolves(confirm);
    }
    this.result.data = await this.run();
    await this.finally(undefined);
    return this.result.data;
  }
  public setHubOrg(org: Org) {
    this.hubOrg = org;
  }
}

const runCmd = async (params: string[], confirm?: boolean) => {
  const cmd = new TestCommand(params, oclifConfigStub);
  stubMethod($$.SANDBOX, cmd, 'assignOrg').callsFake(() => {
    const orgStub = fromStub(
      stubInterface<Org>($$.SANDBOX, {
        getUsername: () => 'test@user.com',
        getConnection: () => ({
          getApiVersion: apiVersionStub,
          tooling: {
            query: queryStub,
          },
        }),
      })
    );
    cmd.setHubOrg(orgStub);
  });
  return cmd.runIt(confirm);
};

describe('force:package:version:delete', () => {
  beforeEach(() => {
    apiVersionStub = $$.SANDBOX.stub().returns('55.0');
    queryStub = $$.SANDBOX.stub();
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
  afterEach(() => {
    $$.SANDBOX.restore();
  });

  it('should error without required --package param', async () => {
    try {
      await runCmd([]);
      expect(false, 'Expected required flag error').to.be.true;
    } catch (err) {
      const error = err as Error;
      expect(error.name).to.equal('Error');
      expect(error.message).to.include('Missing required flag');
      expect(error.message).to.include('-p, --package');
    }
  });

  it('should error pkg version not found in project', async () => {
    try {
      await runCmd(['-p', '04t6A000002zgKSQAY', '-v', 'foor@bar.org'], true);
      expect(false, 'Expected invalid id error').to.be.true;
    } catch (err) {
      const error = err as Error;
      expect(error.name).to.equal('ErrorInvalidIdNoMatchingVersionIdError');
    }
  });
  it('should delete a package version', async () => {
    deleteStub.reset();
    deleteStub = $$.SANDBOX.stub(PackageVersion.prototype, 'delete').resolves({
      errors: [],
      id: 'testId',
      success: true,
    } as PackageSaveResult);
    const results: PackageSaveResult = (await runCmd(
      ['-p', '04t6A000002zgKSQAY', '-v', 'foor@bar.org'],
      true
    )) as PackageSaveResult;
    expect(results.id).to.equal('testId');
    expect(uxLogStub.calledOnce).to.be.true;
    const msg = 'Successfully deleted the package version. testId';
    expect(uxLogStub.args[0][0]).to.equal(msg);
    expect(results.id).to.equal('testId');
  });
  it('should undelete a package version', async () => {
    deleteStub.reset();
    deleteStub = $$.SANDBOX.stub(PackageVersion.prototype, 'undelete').resolves({
      errors: [],
      id: 'testId',
      success: true,
    } as PackageSaveResult);
    const results: PackageSaveResult = (await runCmd(
      ['-p', '04t6A000002zgKSQAY', '-v', 'foor@bar.org', '--undelete'],
      true
    )) as PackageSaveResult;
    expect(uxLogStub.calledOnce).to.be.true;
    const msg = 'Successfully undeleted the package version. testId';
    expect(uxLogStub.args[0][0]).to.equal(msg);
    expect(results.id).to.equal('testId');
  });
});
