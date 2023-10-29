/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'node:os';
import { resolve } from 'node:path';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { PackageVersion, PackageVersionCreateRequestResult, PackagingSObjects } from '@salesforce/packaging';
import * as sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { PackageVersionCreateReportCommand } from '../../../src/commands/package/version/create/report';

import Package2VersionStatus = PackagingSObjects.Package2VersionStatus;

const pkgVersionCreateErrorResult: PackageVersionCreateRequestResult = {
  Id: '08c3i000000fylXXXX',
  Status: Package2VersionStatus.error,
  Package2Id: '0Ho3i000000TNHXXXX',
  // @ts-ignore
  Package2VersionId: null,
  SubscriberPackageVersionId: null,
  // @ts-ignore
  Tag: null,
  // @ts-ignore
  Branch: null,
  Error: [
    'PropertyController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Broker__c',
    'PropertyController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Broker__c',
    'PropertyController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Broker__c',
    'PropertyController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Property__c',
    'SampleDataController: Invalid type: Schema.Broker__c',
    'SampleDataController: Invalid type: Schema.Broker__c',
    'SampleDataController: Invalid type: Schema.Broker__c',
  ],
  CreatedDate: '2022-11-03 09:21',
  HasMetadataRemoved: null,
  CreatedBy: '0053i000001ZIyXXXX',
};

const pkgVersionCreateSuccessResult: PackageVersionCreateRequestResult = {
  Id: '08c3i000000fylgAAA',
  Status: Package2VersionStatus.success,
  Package2Id: '0Ho3i000000TNHYCA4',
  Package2VersionId: '05i3i000000fxw1AAA',
  SubscriberPackageVersionId: '04t3i000002eya2AAA',
  // @ts-ignore
  Tag: null,
  // @ts-ignore
  Branch: null,
  Error: [],
  CreatedDate: '2022-11-03 09:46',
  HasMetadataRemoved: false,
  CreatedBy: '0053i000001ZIyGAAW',
};

describe('package:version:create:report - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let createStatusStub = $$.SANDBOX.stub(PackageVersion, 'getCreateStatus');
  let tableStub: sinon.SinonStub;
  let styledHeaderStub: sinon.SinonStub;
  let warnStub: sinon.SinonStub;
  const config = new Config({ root: resolve(__dirname, '../../package.json') });

  const sandbox = sinon.createSandbox();
  beforeEach(async () => {
    warnStub = sandbox.stub(SfCommand.prototype, 'warn');
    styledHeaderStub = sandbox.stub(SfCommand.prototype, 'styledHeader');
    tableStub = sandbox.stub(SfCommand.prototype, 'table');
  });

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  afterEach(() => {
    $$.restore();
    sandbox.restore();
  });

  describe('package:version:create:report', () => {
    it('should report on a new package version', async () => {
      createStatusStub.resolves(pkgVersionCreateSuccessResult);
      const res = await new PackageVersionCreateReportCommand(
        ['-i', '08c3i000000fyoVAAQ', '-v', 'test@hub.org'],
        config
      ).run();

      expect(res).to.deep.equal([
        {
          Branch: null,
          CreatedBy: '0053i000001ZIyGAAW',
          CreatedDate: '2022-11-03 09:46',
          Error: [],
          HasMetadataRemoved: false,
          Id: '08c3i000000fylgAAA',
          Package2Id: '0Ho3i000000TNHYCA4',
          Package2VersionId: '05i3i000000fxw1AAA',
          Status: 'Success',
          SubscriberPackageVersionId: '04t3i000002eya2AAA',
          Tag: null,
        },
      ]);
      expect(tableStub.callCount).to.equal(1);
      expect(styledHeaderStub.callCount).to.equal(1);
    });

    it('should report multiple errors', async () => {
      createStatusStub = $$.SANDBOX.stub(PackageVersion, 'getCreateStatus');
      createStatusStub.resolves(pkgVersionCreateErrorResult);

      const result = await new PackageVersionCreateReportCommand(
        ['-i', '08c3i000000fyoVAAQ', '-v', 'test@hub.org'],
        config
      ).run();

      expect(warnStub.callCount).to.equal(2);
      expect(result[0]).to.deep.equal({
        Branch: null,
        CreatedBy: '0053i000001ZIyXXXX',
        CreatedDate: '2022-11-03 09:21',
        // requires 12+ errors for error truncation message
        Error: [
          'PropertyController: Invalid type: Schema.Property__c',
          'SampleDataController: Invalid type: Schema.Property__c',
          'SampleDataController: Invalid type: Schema.Broker__c',
          'PropertyController: Invalid type: Schema.Property__c',
          'SampleDataController: Invalid type: Schema.Property__c',
          'SampleDataController: Invalid type: Schema.Broker__c',
          'PropertyController: Invalid type: Schema.Property__c',
          'SampleDataController: Invalid type: Schema.Property__c',
          'SampleDataController: Invalid type: Schema.Broker__c',
          'PropertyController: Invalid type: Schema.Property__c',
          'SampleDataController: Invalid type: Schema.Property__c',
          'SampleDataController: Invalid type: Schema.Broker__c',
          'SampleDataController: Invalid type: Schema.Broker__c',
          'SampleDataController: Invalid type: Schema.Broker__c',
        ],
        HasMetadataRemoved: null,
        Id: '08c3i000000fylXXXX',
        Package2Id: '0Ho3i000000TNHXXXX',
        Package2VersionId: null,
        Status: 'Error',
        SubscriberPackageVersionId: null,
        Tag: null,
      });

      expect(warnStub.firstCall.args[0]).to.include(
        '(11) SampleDataController: Invalid type: Schema.Property__c\n(12) SampleDataController: Invalid type: Schema.Broker__c'
      );
      expect(warnStub.secondCall.args[0]).to.deep.equal(
        `...${os.EOL}${os.EOL}To see all errors, run: sf data:soql:query -t -q "SELECT Message FROM Package2VersionCreateRequestError WHERE ParentRequest.Id='08c3i000000fyoVAAQ'" -o test@hub.org`
      );
    });
  });
});
