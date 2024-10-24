/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { assert, expect } from 'chai';
import sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { Package1Version } from '@salesforce/packaging';
import { Package1VersionCreateGetCommand } from '../../../src/commands/package1/version/create/get.js';

describe('package1:version:create:get', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: import.meta.url });

  // stubs
  let uxStub: sinon.SinonStub;

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  beforeEach(async () => {
    uxStub = $$.SANDBOX.stub(SfCommand.prototype, 'log');
  });

  afterEach(() => {
    $$.restore();
    $$.SANDBOX.restore();
  });

  const libraryStubResult = (status: string, errors?: { errors: Error[] }): void => {
    $$.SANDBOX.stub(Package1Version, 'getCreateStatus').resolves({
      CreatedById: '',
      CreatedDate: 0,
      Description: '',
      // @ts-ignore
      Errors: errors,
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
    const result = await new Package1VersionCreateGetCommand(
      ['--requestid', '0HD4p000000blSkXXX', '--target-org', testOrg.username],
      config
    ).run();
    expect(result.Status).to.equal('SUCCESS');
    expect(uxStub.callCount).to.equal(1);
    expect(uxStub.args[0][0]).to.equal('Successfully uploaded package [04t4p000002BavTXXX]');
  });

  it('should print IN_PROGRESS status correctly', async () => {
    libraryStubResult('IN_PROGRESS');
    const result = await new Package1VersionCreateGetCommand(
      ['--requestid', '0HD4p000000blSkXXX', '--target-org', testOrg.username],
      config
    ).run();

    expect(result.Status).to.equal('IN_PROGRESS');
    expect(uxStub.callCount).to.equal(1);
    // PackageUploadRequest is still InProgress. You can query the status using
    // sf package1:version:create:get -i 0HD4p000000blUvGXX -o admin_9aabdcd7250f980c5a96bf96fb9a9711@gb.org
    expect(uxStub.args[0][0]).to.match(
      /PackageUploadRequest is still InProgress\. You can query the status using\s+sf package1:version:create:get -i 0HD4p000000blUvGXX -o admin_.*@.*\.org/
    );
  });

  it('should print QUEUED status correctly', async () => {
    libraryStubResult('QUEUED');
    const result = await new Package1VersionCreateGetCommand(
      ['--requestid', '0HD4p000000blSkXXX', '--target-org', testOrg.username],
      config
    ).run();

    expect(result.Status).to.equal('QUEUED');
    expect(uxStub.callCount).to.equal(1);
    // "PackageUploadRequest has been enqueued. You can query the status using
    // sf package1:version:create:get -i 0HD4p000000blUvGXX -o admin_59d2d480323a011b8887b00138d2e9bb@gb.org"
    expect(uxStub.args[0][0]).to.match(
      /PackageUploadRequest has been enqueued\. You can query the status using\s+sf package1:version:create:get -i 0HD4p000000blUvGXX -o admin_.*@.*\.org/
    );
  });

  it('should print ERROR status correctly, undefined errors', async () => {
    try {
      libraryStubResult('ERROR', undefined);
      await new Package1VersionCreateGetCommand(
        ['--requestid', '0HD4p000000blSkXXX', '--target-org', testOrg.username],
        config
      ).run();

      assert.fail('the above should throw an error, from the ERROR status');
    } catch (e) {
      expect((e as Error).message).to.match(
        /Package upload failed\.\s+Package version creation failed with unknown error/
      );
    }
  });

  it('should print ERROR status correctly, multiple errors', async () => {
    try {
      libraryStubResult('ERROR', { errors: [new Error('message1')] });
      await new Package1VersionCreateGetCommand(
        ['--requestid', '0HD4p000000blSkXXX', '--target-org', testOrg.username],
        config
      ).run();

      assert.fail('the above should throw an error, from the ERROR status');
    } catch (e) {
      expect((e as Error).message).to.match(/Package upload failed\.\s+message1/);
    }
  });

  it('should print ERROR status correctly, multiple errors (2+)', async () => {
    try {
      libraryStubResult('ERROR', { errors: [new Error('message1'), new Error('message2')] });
      await new Package1VersionCreateGetCommand(
        ['--requestid', '0HD4p000000blSkXXX', '--target-org', testOrg.username],
        config
      ).run();

      assert.fail('the above should throw an error, from the ERROR status');
    } catch (e) {
      expect((e as Error).message).to.match(/Package upload failed\.\s+message1\s+message2/);
    }
  });
});
