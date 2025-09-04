/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import os from 'node:os';
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { assert, expect } from 'chai';
import { PackageVersion, PackageVersionCreateRequestResult, PackagingSObjects } from '@salesforce/packaging';
import sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { env } from '@salesforce/kit';
import { PackageVersionCreateCommand } from '../../../src/commands/package/version/create.js';
import Package2VersionStatus = PackagingSObjects.Package2VersionStatus;

const pkgVersionCreateErrorResult: PackageVersionCreateRequestResult = {
  Id: '08c3i000000fylXXXX',
  Status: Package2VersionStatus.error,
  Package2Id: '0Ho3i000000TNHXXXX',
  Package2VersionId: '',
  SubscriberPackageVersionId: '',
  Tag: '',
  Branch: '',
  Error: [
    'PropertyController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Broker__c',
  ],
  CreatedDate: '2022-11-03 09:21',
  HasMetadataRemoved: null,
  CreatedBy: '0053i000001ZIyXXXX',
  Package2Name: null,
  HasPassedCodeCoverageCheck: null,
  CodeCoverage: null,
  VersionNumber: null,
  ConvertedFromVersionId: null,
  TotalNumberOfMetadataFiles: null,
  TotalSizeOfMetadataFiles: null,
};

const pkgVersionCreateSuccessResult: PackageVersionCreateRequestResult = {
  Id: '08c3i000000fylgAAA',
  Status: Package2VersionStatus.success,
  Package2Id: '0Ho3i000000TNHYCA4',
  Package2VersionId: '05i3i000000fxw1AAA',
  SubscriberPackageVersionId: '04t3i000002eya2AAA',
  Tag: '',
  Branch: '',
  Error: [],
  CreatedDate: '2022-11-03 09:46',
  HasMetadataRemoved: false,
  CreatedBy: '0053i000001ZIyGAAW',
  Package2Name: null,
  HasPassedCodeCoverageCheck: null,
  CodeCoverage: null,
  VersionNumber: null,
  ConvertedFromVersionId: null,
  TotalNumberOfMetadataFiles: null,
  TotalSizeOfMetadataFiles: null,
};

const pkgVersionCreateSuccessResultExceedsFileCount: PackageVersionCreateRequestResult = {
  Id: '08c3i000000fylgAAA',
  Status: Package2VersionStatus.success,
  Package2Id: '0Ho3i000000TNHYCA4',
  Package2VersionId: '05i3i000000fxw1AAA',
  SubscriberPackageVersionId: '04t3i000002eya2AAA',
  Tag: '',
  Branch: '',
  Error: [],
  CreatedDate: '2022-11-03 09:46',
  HasMetadataRemoved: false,
  CreatedBy: '0053i000001ZIyGAAW',
  Package2Name: null,
  HasPassedCodeCoverageCheck: null,
  CodeCoverage: null,
  VersionNumber: null,
  ConvertedFromVersionId: null,
  TotalNumberOfMetadataFiles: 8000,
  TotalSizeOfMetadataFiles: 500 * 1024 * 1024,
};

describe('package:version:create - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let createStub = $$.SANDBOX.stub(PackageVersion, 'create');
  const config = new Config({ root: import.meta.url });

  // stubs
  let logStub: sinon.SinonStub;
  let warnStub: sinon.SinonStub;

  const stubSpinner = (cmd: PackageVersionCreateCommand) => {
    $$.SANDBOX.stub(cmd.spinner, 'start');
    $$.SANDBOX.stub(cmd.spinner, 'stop');
  };

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  beforeEach(async () => {
    logStub = $$.SANDBOX.stub(SfCommand.prototype, 'log');
    warnStub = $$.SANDBOX.stub(SfCommand.prototype, 'warn');
  });

  afterEach(() => {
    $$.restore();
  });

  describe('package:version:create', () => {
    it('should create a new package version', async () => {
      createStub.resolves(pkgVersionCreateSuccessResult);
      const envSpy = $$.SANDBOX.spy(env, 'setBoolean').withArgs('SF_APPLY_REPLACEMENTS_ON_CONVERT', true);

      const cmd = new PackageVersionCreateCommand(['-p', '05i3i000000Gmj6XXX', '-v', 'test@hub.org', '-x'], config);
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(envSpy.calledOnce).to.equal(true);
      expect(res).to.deep.equal({
        Branch: '',
        CreatedBy: '0053i000001ZIyGAAW',
        CreatedDate: '2022-11-03 09:46',
        Error: [],
        HasMetadataRemoved: false,
        Id: '08c3i000000fylgAAA',
        Package2Id: '0Ho3i000000TNHYCA4',
        Package2VersionId: '05i3i000000fxw1AAA',
        Status: 'Success',
        SubscriberPackageVersionId: '04t3i000002eya2AAA',
        Tag: '',
        Package2Name: null,
        HasPassedCodeCoverageCheck: null,
        CodeCoverage: null,
        VersionNumber: null,
        ConvertedFromVersionId: null,
        TotalNumberOfMetadataFiles: null,
        TotalSizeOfMetadataFiles: null,
      });
      expect(warnStub.callCount).to.equal(0);
      expect(logStub.callCount).to.equal(1);
      expect(logStub.args[0]).to.deep.equal([
        `Successfully created the package version [08c3i000000fylgAAA]. Subscriber Package Version Id: 04t3i000002eya2AAA${os.EOL}Package Installation URL: https://login.salesforce.com/packaging/installPackage.apexp?p0=04t3i000002eya2AAA${os.EOL}As an alternative, you can use the "sf package install" command.`,
      ]);
    });

    it('should create a new package version with async validation', async () => {
      createStub = $$.SANDBOX.stub(PackageVersion, 'create');
      createStub.resolves(pkgVersionCreateSuccessResult);
      const envSpy = $$.SANDBOX.spy(env, 'setBoolean').withArgs('SF_APPLY_REPLACEMENTS_ON_CONVERT', true);

      const cmd = new PackageVersionCreateCommand(
        ['-p', '05i3i000000Gmj6XXX', '-v', 'test@hub.org', '-x', '--async-validation'],
        config
      );
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(envSpy.calledOnce).to.equal(true);
      expect(res).to.deep.equal({
        Branch: '',
        CreatedBy: '0053i000001ZIyGAAW',
        CreatedDate: '2022-11-03 09:46',
        Error: [],
        HasMetadataRemoved: false,
        Id: '08c3i000000fylgAAA',
        Package2Id: '0Ho3i000000TNHYCA4',
        Package2VersionId: '05i3i000000fxw1AAA',
        Status: 'Success',
        SubscriberPackageVersionId: '04t3i000002eya2AAA',
        Tag: '',
        Package2Name: null,
        HasPassedCodeCoverageCheck: null,
        CodeCoverage: null,
        VersionNumber: null,
        ConvertedFromVersionId: null,
        TotalNumberOfMetadataFiles: null,
        TotalSizeOfMetadataFiles: null,
      });
      expect(warnStub.callCount).to.equal(0);
      expect(logStub.callCount).to.equal(1);
      expect(logStub.args[0]).to.deep.equal([
        `Successfully created the package version [08c3i000000fylgAAA]. Subscriber Package Version Id: 04t3i000002eya2AAA${os.EOL}Package Installation URL: https://login.salesforce.com/packaging/installPackage.apexp?p0=04t3i000002eya2AAA${os.EOL}As an alternative, you can use the "sf package install" command.`,
      ]);
    });

    it('should create a new package version with total file-count exceeding threshold', async () => {
      createStub = $$.SANDBOX.stub(PackageVersion, 'create');
      createStub.resolves(pkgVersionCreateSuccessResultExceedsFileCount);
      const envSpy = $$.SANDBOX.spy(env, 'setBoolean').withArgs('SF_APPLY_REPLACEMENTS_ON_CONVERT', true);

      const cmd = new PackageVersionCreateCommand(
        ['-p', '05i3i000000Gmj6XXX', '-v', 'test@hub.org', '-x', '--async-validation'],
        config
      );
      stubSpinner(cmd);
      const res = await cmd.run();
      expect(envSpy.calledOnce).to.equal(true);
      expect(res).to.deep.equal({
        Branch: '',
        CreatedBy: '0053i000001ZIyGAAW',
        CreatedDate: '2022-11-03 09:46',
        Error: [],
        HasMetadataRemoved: false,
        Id: '08c3i000000fylgAAA',
        Package2Id: '0Ho3i000000TNHYCA4',
        Package2VersionId: '05i3i000000fxw1AAA',
        Status: 'Success',
        SubscriberPackageVersionId: '04t3i000002eya2AAA',
        Tag: '',
        Package2Name: null,
        HasPassedCodeCoverageCheck: null,
        CodeCoverage: null,
        VersionNumber: null,
        ConvertedFromVersionId: null,
        TotalNumberOfMetadataFiles: 8000,
        TotalSizeOfMetadataFiles: 500 * 1024 * 1024,
      });
      expect(warnStub.callCount).to.equal(2);
      expect(warnStub.args[0]).to.deep.equal([
        'This package contains more than 7000 metadata files. The maximum number of metadata files in a package is 10000. If you reach the file limit, you won’t be able to create new package versions. To confirm the exact file count for this package, run sf package version report and review the “# Metadata Files” column.',
      ]);
      expect(warnStub.args[1]).to.deep.equal([
        'The maximum size of all the metadata files size in a single package is 600 MB. The package version you’re creating exceeds 70% of the metadata file size limit. If you reach the file size limit, you won’t be able to create new package versions. To confirm the exact file size for this package, run "sf package version report" and review the “Metadata File Size” column.',
      ]);
      expect(logStub.callCount).to.equal(1);
      expect(logStub.args[0]).to.deep.equal([
        `Successfully created the package version [08c3i000000fylgAAA]. Subscriber Package Version Id: 04t3i000002eya2AAA${os.EOL}Package Installation URL: https://login.salesforce.com/packaging/installPackage.apexp?p0=04t3i000002eya2AAA${os.EOL}As an alternative, you can use the "sf package install" command.`,
      ]);
    });

    it('should report multiple errors', async () => {
      createStub = $$.SANDBOX.stub(PackageVersion, 'create');
      createStub.resolves(pkgVersionCreateErrorResult);
      try {
        const cmd = new PackageVersionCreateCommand(['-p', '05i3i000000Gmj6XXX', '-v', 'test@hub.org', '-x'], config);
        stubSpinner(cmd);
        await cmd.run();
        assert.fail('the above should throw multiple errors');
      } catch (e) {
        expect((e as Error).message).to.equal(
          `Multiple errors occurred: ${os.EOL}(1) PropertyController: Invalid type: Schema.Property__c${os.EOL}(2) SampleDataController: Invalid type: Schema.Property__c${os.EOL}(3) SampleDataController: Invalid type: Schema.Broker__c`
        );
      }
    });
  });
});
