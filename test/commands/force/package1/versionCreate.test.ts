/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import { Org } from '@salesforce/core';
import { testSetup } from '@salesforce/core/lib/testSetup';
import { fromStub, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { Config } from '@oclif/core';
import { assert, expect } from 'chai';
import { Package1VersionCreateCommand } from '../../../../src/commands/force/package1/beta/version/create';

const $$ = testSetup();
const oclifConfigStub = fromStub(stubInterface<Config>($$.SANDBOX));
let uxStub: sinon.SinonStub;

class TestCommand extends Package1VersionCreateCommand {
  public async runIt() {
    await this.init();
    uxStub = stubMethod($$.SANDBOX, this.ux, 'log');
    return this.run();
  }
  public setOrg(org: Org) {
    this.org = org;
  }
}

const runCmd = async (params: string[], result: string, errors?: { errors: Error[] }) => {
  const cmd = new TestCommand(params, oclifConfigStub);
  stubMethod($$.SANDBOX, cmd, 'assignOrg').callsFake(() => {
    const orgStub = fromStub(
      stubInterface<Org>($$.SANDBOX, {
        getUsername: () => 'test@user.com',
        getConnection: () => ({
            tooling: {
              sobject: () => ({
                  create: () => ({ id: '0HD4p000000blUvGXX' }),
                  retrieve: () => ({
                    Status: result,
                    MetadataPackageVersionId: '04t4p000002BavTXXX',
                    Errors: errors,
                    Id: '0HD4p000000blUvGXX',
                    MetadataPackageId: '03346000000MrC0AXX',
                  }),
                }),
            },
          }),
      })
    );
    cmd.setOrg(orgStub);
  });
  const res = cmd.runIt();

  return res;
};

describe('force:package1:version:create', () => {
  afterEach(() => {
    $$.SANDBOX.restore();
  });

  it('should print SUCCESS status correctly', async () => {
    const result = await runCmd(['--packageid', '03346000000MrC0AXX', '--name', 'test'], 'SUCCESS');
    expect(result.Status).to.equal('SUCCESS');
    expect(uxStub.callCount).to.equal(1);
    expect(uxStub.firstCall.args[0]).to.equal('Successfully uploaded package [04t4p000002BavTXXX]');
  });

  it('should print QUEUED status correctly', async () => {
    const result = await runCmd(['--packageid', '03346000000MrC0AXX', '--name', 'test'], 'QUEUED');
    expect(result.Status).to.equal('QUEUED');
    expect(uxStub.callCount).to.equal(1);
    expect(uxStub.firstCall.args[0]).to.include(
      `PackageUploadRequest has been enqueued. You can query the status using${os.EOL}sfdx force:package1:beta:version:create:get -i 0HD4p000000blUvGXX -u test@user.com`
    );
  });

  it('should validate --version', async () => {
    const result = await runCmd(['--packageid', '03346000000MrC0AXX', '--name', 'test', '--version', '2.3'], 'SUCCESS');
    expect(result.Status).to.equal('SUCCESS');
    expect(uxStub.callCount).to.equal(1);
    expect(uxStub.firstCall.args[0]).to.include('Successfully uploaded package [04t4p000002BavTXXX]');
  });

  it('should validate --version (incorrect format SemVer)', async () => {
    try {
      await runCmd(['--packageid', '03346000000MrC0AXX', '--name', 'test', '--version', '2.3.3'], 'SUCCESS');
      assert.fail('the above should throw an invalid version error');
    } catch (e) {
      expect((e as Error).message).to.include(
        'Version supplied, 2.3.3, is not formatted correctly. Enter in major.minor format, for example, 3.2.'
      );
    }
  });

  it('should validate --version (incorrect format major only)', async () => {
    try {
      await runCmd(['--packageid', '03346000000MrC0AXX', '--name', 'test', '--version', '2'], 'SUCCESS');
      assert.fail('the above should throw an invalid version error');
    } catch (e) {
      expect((e as Error).message).to.include(
        'Version supplied, 2, is not formatted correctly. Enter in major.minor format, for example, 3.2.'
      );
    }
  });
});
