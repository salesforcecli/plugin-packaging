/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import { resolve } from 'path';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup';
import { Config } from '@oclif/core';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { SubscriberPackageVersion } from '@salesforce/packaging';
import { PackageUninstallCommand } from '../../../../src/commands/force/package/beta/uninstall';

describe('force:package:uninstall', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: resolve(__dirname, '../../package.json') });

  const sandbox = sinon.createSandbox();

  // stubs
  let logStub: sinon.SinonStub;

  beforeEach(async () => {
    await config.load();
    logStub = sandbox.stub(SfCommand.prototype, 'log');

    await $$.stubAuths(testOrg);
  });

  afterEach(() => {
    $$.restore();
    sandbox.restore();
  });

  // class TestCommand extends PackageUninstallCommand {
  //   public async runIt() {
  //     await this.init();
  //     uxStub = stubMethod($$.SANDBOX, this.ux, 'log');
  //     return this.run();
  //   }
  //   public setOrg(org: Org) {
  //     this.org = org;
  //   }
  //   public setProject(project: SfProject) {
  //     this.project = project;
  //   }
  // }

  // const runCmd = async (params: string[], status: string) => {
  //   const cmd = new TestCommand(params, oclifConfigStub);
  //   stubMethod($$.SANDBOX, cmd, 'assignOrg').callsFake(() => {
  //     const orgStub = fromStub(
  //       stubInterface<Org>($$.SANDBOX, {
  //         getUsername: () => 'test@user.com',
  //         getConnection: () => ({
  //           tooling: {
  //             sobject: () => ({
  //               create: () => ({ id: '04t4p000002BaHYXXX' }),
  //               retrieve: () => ({
  //                 Id: '06y23000000002MXXX',
  //                 IsDeleted: false,
  //                 CreatedDate: '2022-08-02T17:13:00.000+0000',
  //                 CreatedById: '00523000003Ehj9XXX',
  //                 LastModifiedDate: '2022-08-02T17:13:00.000+0000',
  //                 LastModifiedById: '00523000003Ehj9XXX',
  //                 SystemModstamp: '2022-08-02T17:13:00.000+0000',
  //                 SubscriberPackageVersionId: '04t4p000002BaHYXXX',
  //                 Status: status,
  //               }),
  //             }),
  //           },
  //         }),
  //       })
  //     );
  //     cmd.setOrg(orgStub);
  //   });
  //   cmd.setProject(SfProject.getInstance());
  //
  //   return cmd.runIt();
  // };

  const libraryStubResult = (status: 'Error' | 'InProgress' | 'Queued' | 'Success'): void => {
    sandbox.stub(SubscriberPackageVersion.prototype, 'uninstall').resolves({
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
      `PackageUninstallRequest is currently InProgress.${os.EOL}You can continue to query the status using sfdx force:package:beta:uninstall:report -i 06y23000000002MXXX -u ${testOrg.username}`
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
