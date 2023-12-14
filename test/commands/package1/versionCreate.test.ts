/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import os from 'node:os';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { Config } from '@oclif/core';
import { assert, expect } from 'chai';
import { SfCommand } from '@salesforce/sf-plugins-core';
import sinon from 'sinon';
import { Package1Version } from '@salesforce/packaging';
import { Package1VersionCreateCommand } from '../../../src/commands/package1/version/create.js';

describe('package1:version:create', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: import.meta.url });

  const sandbox = sinon.createSandbox();

  // stubs
  let uxLogStub: sinon.SinonStub;

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  beforeEach(async () => {
    uxLogStub = sandbox.stub(SfCommand.prototype, 'log');
  });

  afterEach(() => {
    $$.restore();
    sandbox.restore();
  });

  const libraryStubResult = (status: string): void => {
    sandbox.stub(Package1Version, 'create').resolves({
      CreatedById: '',
      CreatedDate: 0,
      Description: '',
      Errors: [],
      IsDeleted: false,
      IsReleaseVersion: false,
      LastModifiedById: '',
      LastModifiedDate: 0,
      MajorVersion: 0,
      MetadataPackageId: '',
      MetadataPackageVersionId: '04t4p000002BavTXXX',
      MinorVersion: 0,
      Password: '',
      PostInstallUrl: '',
      ReleaseNotesUrl: '',
      SystemModstamp: 0,
      VersionName: '',
      Status: status,
      Id: '0HD4p000000blUvGXX',
    });
  };

  it('should print SUCCESS status correctly', async () => {
    libraryStubResult('SUCCESS');
    const command = new Package1VersionCreateCommand(
      ['--package-id', '03346000000MrC0AXX', '--name', 'test', '--target-org', testOrg.username],
      config
    );
    const result = await command.run();

    expect(result.Status).to.equal('SUCCESS');
    expect(uxLogStub.callCount).to.equal(1);
    expect(uxLogStub.firstCall.args[0]).to.equal('Successfully uploaded package [04t4p000002BavTXXX]');
  });

  it('should print QUEUED status correctly', async () => {
    libraryStubResult('QUEUED');
    const command = new Package1VersionCreateCommand(
      ['--package-id', '03346000000MrC0AXX', '--name', 'test', '--target-org', testOrg.username],
      config
    );
    const result = await command.run();

    expect(result.Status).to.equal('QUEUED');
    expect(uxLogStub.callCount).to.equal(1);
    expect(uxLogStub.firstCall.args[0]).to.equal(
      `PackageUploadRequest has been enqueued. You can query the status using${os.EOL}sf package1:version:create:get -i 0HD4p000000blUvGXX -o ${testOrg.username}`
    );
  });

  it('should validate --version', async () => {
    libraryStubResult('SUCCESS');
    const command = new Package1VersionCreateCommand(
      ['--package-id', '03346000000MrC0AXX', '--name', 'test', '--version', '2.3', '--target-org', testOrg.username],
      config
    );
    const result = await command.run();

    expect(result.Status).to.equal('SUCCESS');
    expect(uxLogStub.callCount).to.equal(1);
    expect(uxLogStub.firstCall.args[0]).to.include('Successfully uploaded package [04t4p000002BavTXXX]');
  });

  it('should validate --version (incorrect format SemVer)', async () => {
    try {
      libraryStubResult('SUCCESS');
      const command = new Package1VersionCreateCommand(
        ['--packageid', '03346000000MrC0AXX', '--name', 'test', '--version', '2.3.3', '--target-org', testOrg.username],
        config
      );
      await command.run();
      assert.fail('the above should throw an invalid version error');
    } catch (e) {
      expect((e as Error).message).to.include(
        'Version supplied, 2.3.3, is not formatted correctly. Enter in major.minor format, for example, 3.2.'
      );
    }
  });

  it('should validate --version (incorrect format major only)', async () => {
    try {
      libraryStubResult('SUCCESS');
      const command = new Package1VersionCreateCommand(
        ['--packageid', '03346000000MrC0AXX', '--name', 'test', '--version', '2', '--target-org', testOrg.username],
        config
      );
      await command.run();

      assert.fail('the above should throw an invalid version error');
    } catch (e) {
      expect((e as Error).message).to.include(
        'Version supplied, 2, is not formatted correctly. Enter in major.minor format, for example, 3.2.'
      );
    }
  });
});
