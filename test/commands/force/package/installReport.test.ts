/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { EOL } from 'os';
import { Org } from '@salesforce/core';
import { testSetup } from '@salesforce/core/lib/testSetup';
import { fromStub, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { PackagingSObjects, SubscriberPackageVersion } from '@salesforce/packaging';
import { Result } from '@salesforce/command';
import { Report } from '../../../../src/commands/force/package/beta/install/report';

describe('force:package:install:report', () => {
  const $$ = testSetup();
  const oclifConfigStub = fromStub(stubInterface<Config>($$.SANDBOX));
  let uxLogStub: sinon.SinonStub;
  let getInstallRequestStub: sinon.SinonStub;

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
    Status: 'IN_PROGRESS',
    Errors: null,
  };

  class TestCommand extends Report {
    public async runIt() {
      this.result = new Result(this.statics.result);
      await this.init();
      uxLogStub = stubMethod($$.SANDBOX, this.ux, 'log');
      this.result.data = await this.run();
      await this.finally(undefined);
      return this.result.data;
    }
    public setOrg(org: Org) {
      this.org = org;
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
      cmd.setOrg(orgStub);
    });
    return cmd.runIt();
  };

  beforeEach(() => {});
  afterEach(() => {
    $$.SANDBOX.restore();
  });

  it('should error without required --requestid param', async () => {
    try {
      await runCmd([]);
      expect(false, 'Expected required flag error').to.be.true;
    } catch (err) {
      const error = err as Error;
      expect(error.name).to.equal('Error');
      expect(error.message).to.include('Missing required flag requestid');
    }
  });

  it('should report SUCCESS status', async () => {
    const request = Object.assign({}, pkgInstallRequest, { Status: 'SUCCESS' });
    getInstallRequestStub = $$.SANDBOXES.DEFAULT.stub(SubscriberPackageVersion, 'getInstallRequest').resolves(
      request as PackagingSObjects.PackageInstallRequest
    );
    const result = await runCmd(['-i', pkgInstallRequest.Id]);
    expect(result).to.deep.equal(request);
    expect(uxLogStub.calledOnce).to.be.true;
    expect(uxLogStub.args[0][0]).to.equal('Successfully installed package [04t6A000002zgKSQAY]');
  });

  it('should report IN_PROGRESS status', async () => {
    getInstallRequestStub.restore();
    getInstallRequestStub = $$.SANDBOXES.DEFAULT.stub(SubscriberPackageVersion, 'getInstallRequest').resolves(
      pkgInstallRequest as PackagingSObjects.PackageInstallRequest
    );
    const result = await runCmd(['-i', pkgInstallRequest.Id]);
    expect(result).to.deep.equal(pkgInstallRequest);
    expect(uxLogStub.calledOnce).to.be.true;
    const msg = `PackageInstallRequest is currently InProgress. You can continue to query the status using${EOL}sfdx force:package:beta:install:report -i 0Hf1h0000006sh2CAA -u test@user.com`;
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
      await runCmd(['-i', pkgInstallRequest.Id]);
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
