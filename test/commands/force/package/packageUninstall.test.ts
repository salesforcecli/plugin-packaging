/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Org, SfProject } from '@salesforce/core';
import { testSetup } from '@salesforce/core/lib/testSetup';
import { fromStub, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { Config } from '@oclif/core';
import { assert, expect } from 'chai';
import { PackageUninstallCommand } from '../../../../src/commands/force/package/beta/uninstall';

const $$ = testSetup();
const oclifConfigStub = fromStub(stubInterface<Config>($$.SANDBOX));
let uxStub: sinon.SinonStub;

class TestCommand extends PackageUninstallCommand {
  public async runIt() {
    await this.init();
    uxStub = stubMethod($$.SANDBOX, this.ux, 'log');
    return this.run();
  }
  public setOrg(org: Org) {
    this.org = org;
  }
  public setProject(project: SfProject) {
    this.project = project;
  }
}

const runCmd = async (params: string[], status: string) => {
  const cmd = new TestCommand(params, oclifConfigStub);
  stubMethod($$.SANDBOX, cmd, 'assignOrg').callsFake(() => {
    const orgStub = fromStub(
      stubInterface<Org>($$.SANDBOX, {
        getUsername: () => 'test@user.com',
        getConnection: () => {
          return {
            tooling: {
              sobject: () => {
                return {
                  create: () => ({ id: '04t4p000002BaHYXXX' }),
                  retrieve: () => ({
                    Id: '06y23000000002MXXX',
                    IsDeleted: false,
                    CreatedDate: '2022-08-02T17:13:00.000+0000',
                    CreatedById: '00523000003Ehj9XXX',
                    LastModifiedDate: '2022-08-02T17:13:00.000+0000',
                    LastModifiedById: '00523000003Ehj9XXX',
                    SystemModstamp: '2022-08-02T17:13:00.000+0000',
                    SubscriberPackageVersionId: '04t4p000002BaHYXXX',
                    Status: status,
                  }),
                };
              },
            },
          };
        },
      })
    );
    cmd.setOrg(orgStub);
  });
  cmd.setProject(SfProject.getInstance());

  return cmd.runIt();
};

describe('force:package:uninstall', () => {
  afterEach(() => {
    $$.SANDBOX.restore();
  });

  it('should print Success status correctly', async () => {
    const result = await runCmd(['--package', '04t4p000002BaHYXXX'], 'Success');
    expect(result.Status).to.equal('Success');
    expect(uxStub.callCount).to.equal(1);
    expect(uxStub.firstCall.args[0]).to.equal('Successfully uninstalled package [04t4p000002BaHYXXX]');
  });

  it('should print InProgress status correctly', async () => {
    const result = await runCmd(['--package', '04t4p000002BaHYXXX'], 'InProgress');
    expect(result.Status).to.equal('InProgress');
    expect(uxStub.callCount).to.equal(1);
    expect(uxStub.firstCall.args[0]).to.equal(
      `PackageUninstallRequest is currently InProgress.
You can continue to query the status using sfdx force:package:beta:uninstall:report -i 06y23000000002MXXX -u test@user.com`
    );
  });

  it('should validate --package', async () => {
    const result = await runCmd(['--package', '04t4p000002BaHYXXX'], 'Success');
    expect(result.Status).to.equal('Success');
    expect(uxStub.callCount).to.equal(1);
    expect(uxStub.firstCall.args[0]).to.equal('Successfully uninstalled package [04t4p000002BaHYXXX]');
  });

  it("should validate --package (doesn't start with 04t)", async () => {
    try {
      await runCmd(['--package', '03t4p000002BaHYXXX'], 'Success');
      assert.fail('the above should throw an invalid version error');
    } catch (e) {
      expect((e as Error).message).to.include(
        'Invalid alias or ID: 03t4p000002BaHYXXX. Either your alias is invalid or undefined, or the ID provided is invalid (must start with 04t).'
      );
    }
  });
});
