/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { Package, PackageVersionCreateRequestResult, PackagingSObjects } from '@salesforce/packaging';
import sinon from 'sinon';
import { PackageConvert } from '../../../src/commands/package/convert.js';
import Package2VersionStatus = PackagingSObjects.Package2VersionStatus;

const CONVERTED_FROM_PACKAGE_ID = '033xx0000004Gmn';
const INSTALL_KEY = 'testinstallkey';

describe('package:convert', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: import.meta.url });

  // stubs
  let spinnerStartStub: sinon.SinonStub;
  let convertStub: sinon.SinonStub;

  const stubSpinner = (cmd: PackageConvert) => {
    spinnerStartStub = $$.SANDBOX.stub(cmd.spinner, 'start');
    $$.SANDBOX.stub(cmd.spinner, 'stop');
  };

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  afterEach(() => {
    $$.restore();
  });

  it('returns error for missing installationkey or installationkeybypass flag', async () => {
    const expectedErrorMsg =
      'Exactly one of the following must be provided: --installation-key, --installation-key-bypass';

    try {
      const cmd = new PackageConvert(['-p', CONVERTED_FROM_PACKAGE_ID, '-v', 'test@user.com'], config);
      stubSpinner(cmd);
      await cmd.run();
    } catch (e) {
      expect((e as Error).message).to.include(expectedErrorMsg);
    }
  });

  it('starts package version create request (in progress)', async () => {
    const pvc = {
      Branch: 'main',
      ConvertedFromVersionId: null,
      CreatedBy: '133',
      CreatedDate: '2022-08-31 11:48',
      Error: [],
      HasMetadataRemoved: false,
      HasPassedCodeCoverageCheck: false,
      Id: '08c3i000000bmf6AAA',
      Package2Id: '0Ho3i000000Gmj6CAC',
      Package2Name: 'MyTestPackage',
      Package2VersionId: '05i3i000000bllhAAA',
      Status: Package2VersionStatus.inProgress,
      SubscriberPackageVersionId: '04t3i000002OUEkAAO',
      Tag: '',
      CodeCoverage: null,
      VersionNumber: null,
    } satisfies PackageVersionCreateRequestResult;

    convertStub = $$.SANDBOX.stub(Package, 'convert').resolves(pvc);
    const cmd = new PackageConvert(
      ['-p', CONVERTED_FROM_PACKAGE_ID, '--installation-key', INSTALL_KEY, '-v', 'test@user.com'],
      config
    );
    stubSpinner(cmd);
    const result = await cmd.run();

    expect(spinnerStartStub.called).to.be.true;
    expect(result).to.deep.equal(pvc);
  });
  it('starts package version create request (success)', async () => {
    const pvc = {
      Branch: 'main',
      ConvertedFromVersionId: '04t3i000002OUEkAAO',
      CreatedBy: '133',
      CreatedDate: '2022-08-31 11:48',
      Error: [],
      HasMetadataRemoved: false,
      HasPassedCodeCoverageCheck: false,
      Id: '08c3i000000bmf6AAA',
      Package2Id: '0Ho3i000000Gmj6CAC',
      Package2Name: 'MyTestPackage',
      Package2VersionId: '05i3i000000bllhAAA',
      Status: Package2VersionStatus.success,
      SubscriberPackageVersionId: '04t3i000002OUEkAAO',
      Tag: '',
      CodeCoverage: null,
      VersionNumber: null,
    };

    convertStub.restore();
    convertStub = $$.SANDBOX.stub(Package, 'convert').resolves(pvc);
    const cmd = new PackageConvert(
      ['-p', CONVERTED_FROM_PACKAGE_ID, '--installation-key', INSTALL_KEY, '-v', 'test@user.com'],
      config
    );
    stubSpinner(cmd);
    const result = await cmd.run();
    expect(result).to.deep.equal(pvc);
  });
  it('starts package version create request (error)', async () => {
    const pvc = {
      Branch: 'main',
      ConvertedFromVersionId: null,
      CreatedBy: '133',
      CreatedDate: '2022-08-31 11:48',
      Error: [new Error('server error 1'), new Error('server error 2')],
      HasMetadataRemoved: false,
      HasPassedCodeCoverageCheck: false,
      Id: '08c3i000000bmf6AAA',
      Package2Id: '0Ho3i000000Gmj6CAC',
      Package2Name: 'MyTestPackage',
      Package2VersionId: '05i3i000000bllhAAA',
      Status: Package2VersionStatus.error,
      SubscriberPackageVersionId: '04t3i000002OUEkAAO',
      Tag: '',
      CodeCoverage: null,
      VersionNumber: null,
      TotalNumberOfMetadataFiles: null,
    };

    convertStub.restore();
    convertStub = $$.SANDBOX.stub(Package, 'convert').resolves(pvc);
    try {
      const cmd = new PackageConvert(
        ['-p', CONVERTED_FROM_PACKAGE_ID, '--installation-key', INSTALL_KEY, '-v', 'test@user.com'],
        config
      );
      stubSpinner(cmd);
      await cmd.run();
    } catch (e) {
      expect((e as Error).message).to.include('Error: server error 1');
      expect((e as Error).message).to.include('Error: server error 2');
    }
  });
});
