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
import { EOL } from 'node:os';
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { PackagingSObjects, SubscriberPackageVersion } from '@salesforce/packaging';
import sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { Report } from '../../../src/commands/package/install/report.js';

const pkgInstallRequest = {
  attributes: {
    type: 'PackageInstallRequest',
    url: '/services/data/v55.0/tooling/sobjects/PackageInstallRequest/0Hf1h0000006sh2CAA',
  },
  Id: '0Hf1h0000006sh2CAA',
  IsDeleted: false,
  CreatedDate: '2022-08-09T05:13:14.000+0000',
  CreatedById: '0051h000009NugzAAC',
  LastModifiedDate: '2022-08-09T05:13:14.000+0000',
  LastModifiedById: '0051h000009NugzAAC',
  SystemModstamp: '2022-08-09T05:13:14.000+0000',
  SubscriberPackageVersionKey: '04t6A000002zgKSQAY',
  NameConflictResolution: 'Block',
  SecurityType: 'None',
  PackageInstallSource: 'U',
  ProfileMappings: null,
  Password: null,
  EnableRss: false,
  UpgradeType: 'mixed-mode',
  ApexCompileType: 'all',
  SkipHandlers: null,
  Status: 'IN_PROGRESS',
  Errors: null,
};

describe('package:install:report', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: import.meta.url });

  // stubs
  let uxLogStub: sinon.SinonStub;
  let getInstallRequestStub: sinon.SinonStub;

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  beforeEach(async () => {
    uxLogStub = $$.SANDBOX.stub(SfCommand.prototype, 'log');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should error without required --request-id param', async () => {
    try {
      await new Report(['--target-org', testOrg.username], config).run();
      expect(false, 'Expected required flag error').to.be.true;
    } catch (err) {
      const error = err as Error;
      expect(error.name).to.equal('Error');
      expect(error.message).to.include('Missing required flag request-id');
    }
  });

  it('should report SUCCESS status', async () => {
    const request = Object.assign({}, pkgInstallRequest, { Status: 'SUCCESS' });
    getInstallRequestStub = $$.SANDBOXES.DEFAULT.stub(SubscriberPackageVersion, 'getInstallRequest').resolves(
      request as PackagingSObjects.PackageInstallRequest
    );
    const result = await new Report(['-i', pkgInstallRequest.Id, '--target-org', testOrg.username], config).run();
    expect(result).to.deep.equal(request);
    expect(uxLogStub.calledOnce).to.be.true;
    expect(uxLogStub.args[0][0]).to.equal('Successfully installed package [04t6A000002zgKSQAY]');
  });

  it('should report IN_PROGRESS status', async () => {
    getInstallRequestStub.restore();
    getInstallRequestStub = $$.SANDBOXES.DEFAULT.stub(SubscriberPackageVersion, 'getInstallRequest').resolves(
      pkgInstallRequest as PackagingSObjects.PackageInstallRequest
    );
    const result = await new Report(['-i', pkgInstallRequest.Id, '--target-org', testOrg.username], config).run();
    expect(result).to.deep.equal(pkgInstallRequest);
    expect(uxLogStub.calledOnce).to.be.true;
    const msg = `PackageInstallRequest is currently InProgress. You can continue to query the status using${EOL}sf package:install:report -i 0Hf1h0000006sh2CAA -o ${testOrg.username}`;
    expect(uxLogStub.args[0][0]).to.equal(msg);
  });

  it('should throw error on ERROR status', async () => {
    const request = Object.assign({}, pkgInstallRequest, {
      Status: 'ERROR',
      Errors: { errors: [new Error('message 1'), new Error('message 2')] },
    });
    getInstallRequestStub.restore();
    getInstallRequestStub = $$.SANDBOXES.DEFAULT.stub(SubscriberPackageVersion, 'getInstallRequest').resolves(
      request as PackagingSObjects.PackageInstallRequest
    );

    getInstallRequestStub.resolves(request);
    try {
      await new Report(['-i', pkgInstallRequest.Id, '--target-org', testOrg.username], config).run();
      expect(false, 'Expected PackageInstallError').to.be.true;
    } catch (err) {
      const error = err as Error;
      expect(error.name).to.equal('PackageInstallError');
      expect(error.message).to.equal(
        'Encountered errors installing the package! Installation errors: \n1) message 1\n2) message 2'
      );
    }
  });
});
