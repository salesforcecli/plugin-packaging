/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Org } from '@salesforce/core';
import { TestContext } from '@salesforce/core/lib/testSetup';
import { fromStub, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { Config } from '@oclif/core';
import { assert, expect } from 'chai';
import { Package1VersionCreateGetCommand } from '../../../../src/commands/force/package1/version/create/get';

describe('force:package1:version:create:get', () => {
  const $$ = new TestContext();
  const oclifConfigStub = fromStub(stubInterface<Config>($$.SANDBOX));
  let uxStub: sinon.SinonStub;

  class TestCommand extends Package1VersionCreateGetCommand {
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
                retrieve: () =>
                  Promise.resolve({
                    Status: result,
                    MetadataPackageVersionId: '04t4p000002BavTXXX',
                    Errors: errors,
                  }),
              }),
            },
          }),
        })
      );
      cmd.setOrg(orgStub);
    });
    return cmd.runIt();
  };

  it('should print SUCCESS status correctly', async () => {
    const result = await runCmd(['--requestid', '0HD4p000000blSkXXX'], 'SUCCESS');
    expect(result.Status).to.equal('SUCCESS');
    expect(uxStub.callCount).to.equal(1);
    expect(uxStub.firstCall.args[0]).to.equal('Successfully uploaded package [04t4p000002BavTXXX]');
  });

  it('should print IN_PROGRESS status correctly', async () => {
    const result = await runCmd(['--requestid', '0HD4p000000blSkXXX'], 'IN_PROGRESS');
    expect(result.Status).to.equal('IN_PROGRESS');
    expect(uxStub.callCount).to.equal(1);
    expect(uxStub.firstCall.args[0]).to.match(
      /PackageUploadRequest is still InProgress\. You can query the status using\s+sfdx force:package1:version:create:get -i undefined -u test@user\.com/
    );
  });

  it('should print QUEUED status correctly', async () => {
    const result = await runCmd(['--requestid', '0HD4p000000blSkXXX'], 'QUEUED');
    expect(result.Status).to.equal('QUEUED');
    expect(uxStub.callCount).to.equal(1);
    expect(uxStub.firstCall.args[0]).to.match(
      /PackageUploadRequest has been enqueued\. You can query the status using\s+sfdx force:package1:version:create:get -i undefined -u test@user\.com/
    );
  });

  it('should print ERROR status correctly, undefined errors', async () => {
    try {
      await runCmd(['--requestid', '0HD4p000000blSkXXX'], 'ERROR');
      assert.fail('the above should throw an erorr, from the ERROR status');
    } catch (e) {
      expect((e as Error).message).to.match(
        /Package upload failed\.\s+Package version creation failed with unknown error/
      );
    }
  });

  it('should print ERROR status correctly, multiple errors', async () => {
    try {
      await runCmd(['--requestid', '0HD4p000000blSkXXX'], 'ERROR', { errors: [new Error('message1')] });
      assert.fail('the above should throw an erorr, from the ERROR status');
    } catch (e) {
      expect((e as Error).message).to.match(/Package upload failed\.\s+message1/);
    }
  });

  it('should print ERROR status correctly, multiple errors (2+)', async () => {
    try {
      await runCmd(['--requestid', '0HD4p000000blSkXXX'], 'ERROR', {
        errors: [new Error('message1'), new Error('message2')],
      });
      assert.fail('the above should throw an erorr, from the ERROR status');
    } catch (e) {
      expect((e as Error).message).to.match(/Package upload failed\.\s+message1\s+message2/);
    }
  });
});
