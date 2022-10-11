/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { fromStub, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { Org } from '@salesforce/core';
import { testSetup } from '@salesforce/core/lib/testSetup';
import { Config } from '@oclif/core';
import { Package, PackagingSObjects } from '@salesforce/packaging';
import { PackageConvert } from '../../../../src/commands/force/package/beta/convert';
import Package2VersionStatus = PackagingSObjects.Package2VersionStatus;

const CONVERTED_FROM_PACKAGE_ID = '033xx0000004Gmn';
const INSTALL_KEY = 'testinstallkey';
const $$ = testSetup();
const oclifConfigStub = fromStub(stubInterface<Config>($$.SANDBOX));
let uxLogStub: sinon.SinonStub;
let convertStub: sinon.SinonStub;

class TestCommand extends PackageConvert {
  public async runIt() {
    await this.init();
    uxLogStub = stubMethod($$.SANDBOX, this.ux, 'log');
    return this.run();
  }
  public setHubOrg(org: Org) {
    this.hubOrg = org;
  }
}

const runCmd = async (params: string[]) => {
  const cmd = new TestCommand(params, oclifConfigStub);
  stubMethod($$.SANDBOX, cmd, 'assignOrg').callsFake(() => {
    const orgStub = fromStub(
      stubInterface<Org>($$.SANDBOX, {
        getUsername: () => 'test@user.com',
        getConnection: () => ({}),
      })
    );
    cmd.setHubOrg(orgStub);
  });

  return cmd.runIt();
};

describe('force:package:convert', () => {
  beforeEach(() => {});

  afterEach(() => {
    $$.SANDBOX.restore();
  });

  it('returns error for missing installationkey or installationkeybypass flag', async () => {
    const expectedErrorMsg =
      'Exactly one of the following must be provided: --installationkey, --installationkeybypass';

    try {
      await runCmd(['-p', CONVERTED_FROM_PACKAGE_ID]);
    } catch (e) {
      expect((e as Error).message).to.include(expectedErrorMsg);
    }
  });

  it('starts package version create request (in progress)', async () => {
    const pvc = {
      Branch: 'main',
      CreatedBy: '133',
      CreatedDate: '2022-08-31 11:48',
      Error: [],
      HasMetadataRemoved: false,
      Id: '08c3i000000bmf6AAA',
      Package2Id: '0Ho3i000000Gmj6CAC',
      Package2VersionId: '05i3i000000bllhAAA',
      Status: Package2VersionStatus.inProgress,
      SubscriberPackageVersionId: '04t3i000002OUEkAAO',
      Tag: '',
    };

    convertStub = $$.SANDBOX.stub(Package, 'convert').resolves(pvc);
    const result = await runCmd([
      '-p',
      CONVERTED_FROM_PACKAGE_ID,
      '--installationkey',
      INSTALL_KEY,
      '-v',
      'test@user.com',
    ]);
    expect(uxLogStub.calledOnce).to.be.true;
    expect(uxLogStub.firstCall.args[0]).to.include(
      'Package version creation request status is \'In Progress\'. Run "sfdx force:package:version:create:report -i 08c3i000000bmf6AAA" to query for status.'
    );
    expect(result).to.deep.equal(pvc);
  });
  it('starts package version create request (success)', async () => {
    const pvc = {
      Branch: 'main',
      CreatedBy: '133',
      CreatedDate: '2022-08-31 11:48',
      Error: [],
      HasMetadataRemoved: false,
      Id: '08c3i000000bmf6AAA',
      Package2Id: '0Ho3i000000Gmj6CAC',
      Package2VersionId: '05i3i000000bllhAAA',
      Status: Package2VersionStatus.success,
      SubscriberPackageVersionId: '04t3i000002OUEkAAO',
      Tag: '',
    };

    convertStub.restore();
    convertStub = $$.SANDBOX.stub(Package, 'convert').resolves(pvc);
    const result = await runCmd([
      '-p',
      CONVERTED_FROM_PACKAGE_ID,
      '--installationkey',
      INSTALL_KEY,
      '-v',
      'test@user.com',
    ]);
    expect(uxLogStub.calledOnce).to.be.true;
    expect(uxLogStub.firstCall.args[0]).to.include(
      'Successfully created the package version [08c3i000000bmf6AAA]. Subscriber Package Version Id: 04t3i000002OUEkAAO'
    );
    expect(uxLogStub.firstCall.args[0]).to.include(
      'Package Installation URL: https://login.salesforce.com/packaging/installPackage.apexp?p0=04t3i000002OUEkAAO'
    );
    expect(uxLogStub.firstCall.args[0]).to.include(
      'As an alternative, you can use the "sfdx force:package:install" command.'
    );
    expect(result).to.deep.equal(pvc);
  });
  it('starts package version create request (error)', async () => {
    const pvc = {
      Branch: 'main',
      CreatedBy: '133',
      CreatedDate: '2022-08-31 11:48',
      Error: [new Error('server error 1'), new Error('server error 2')],
      HasMetadataRemoved: false,
      Id: '08c3i000000bmf6AAA',
      Package2Id: '0Ho3i000000Gmj6CAC',
      Package2VersionId: '05i3i000000bllhAAA',
      Status: Package2VersionStatus.error,
      SubscriberPackageVersionId: '04t3i000002OUEkAAO',
      Tag: '',
    };

    convertStub.restore();
    convertStub = $$.SANDBOX.stub(Package, 'convert').resolves(pvc);
    try {
      await runCmd(['-p', CONVERTED_FROM_PACKAGE_ID, '--installationkey', INSTALL_KEY, '-v', 'test@user.com']);
    } catch (e) {
      expect((e as Error).message).to.include('Error: server error 1');
      expect((e as Error).message).to.include('Error: server error 2');
    }
  });
});
