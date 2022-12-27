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
import { expect } from 'chai';
import { PackageVersion, PackageVersionCreateRequestResult, PackagingSObjects } from '@salesforce/packaging';
import * as sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { PackageVersionCreateReportCommand } from '../../../../src/commands/force/package/beta/version/create/report';

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

describe('force:package:version:create:report - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let createStatusStub = $$.SANDBOX.stub(PackageVersion, 'getCreateStatus');
  let tableStub: sinon.SinonStub;
  let styledHeaderStub: sinon.SinonStub;
  let logStub: sinon.SinonStub;
  const config = new Config({ root: resolve(__dirname, '../../package.json') });

  const sandbox = sinon.createSandbox();
  beforeEach(async () => {
    await config.load();
    logStub = sandbox.stub(SfCommand.prototype, 'log');
    styledHeaderStub = sandbox.stub(SfCommand.prototype, 'styledHeader');
    tableStub = sandbox.stub(SfCommand.prototype, 'table');

    await $$.stubAuths(testOrg);
  });

  afterEach(() => {
    $$.restore();
    sandbox.restore();
  });

  describe('force:package:version:create:report', () => {
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

      expect(logStub.callCount).to.equal(3);
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
      expect(logStub.secondCall.args[0]).to.include(
        '(1) PropertyController: Invalid type: Schema.Property__c\n(2) SampleDataController: Invalid type: Schema.Property__c\n(3) SampleDataController: Invalid type: Schema.Broker__c'
      );
      expect(logStub.secondCall.args[0]).to.include(
        '(11) SampleDataController: Invalid type: Schema.Property__c\n(12) SampleDataController: Invalid type: Schema.Broker__c'
      );
      expect(logStub.thirdCall.args[0]).to.deep.equal(
        `...${os.EOL}${os.EOL}To see all errors, run: sfdx force:data:soql:query -t -q "SELECT Message FROM Package2VersionCreateRequestError WHERE ParentRequest.Id='08c3i000000fyoVAAQ'" -u test@hub.org`
      );
    });
  });
});
