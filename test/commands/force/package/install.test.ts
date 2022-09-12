/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { EOL } from 'os';
import { Lifecycle, Org, SfError, SfProject, SfProjectJson } from '@salesforce/core';
import { testSetup } from '@salesforce/core/lib/testSetup';
import { fromStub, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { Package } from '@salesforce/packaging';
import { Result } from '@salesforce/command';
import { Install } from '../../../../src/commands/force/package/beta/install';

const $$ = testSetup();
const oclifConfigStub = fromStub(stubInterface<Config>($$.SANDBOX));
let uxLogStub: sinon.SinonStub;
let uxSetSpinnerStatusStub: sinon.SinonStub;
let uxConfirmStub: sinon.SinonStub;
let apiVersionStub: sinon.SinonStub;
let queryStub: sinon.SinonStub;
let packageStub: sinon.SinonStub;
let getExternalSitesStub: sinon.SinonStub;
let installStub: sinon.SinonStub;
let waitForPublishStub: sinon.SinonStub;

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

const pkgInstallCreateRequest = {
  SubscriberPackageVersionKey: '04t6A000002zgKSQAY',
  Password: undefined,
  ApexCompileType: 'all',
  SecurityType: 'none',
  UpgradeType: 'mixed-mode',
};

class TestCommand extends Install {
  public async runIt(confirm: boolean) {
    this.result = new Result(this.statics.result);
    await this.init();
    uxLogStub = stubMethod($$.SANDBOX, this.ux, 'log');
    uxSetSpinnerStatusStub = stubMethod($$.SANDBOX, this.ux, 'setSpinnerStatus');
    uxConfirmStub = stubMethod($$.SANDBOX, this.ux, 'confirm');
    if (confirm) {
      uxConfirmStub.resolves(confirm);
    }
    this.result.data = await this.run();
    await this.finally(undefined);
    return this.result.data;
  }
  public setOrg(org: Org) {
    this.org = org;
  }
}

const runCmd = async (params: string[], confirm?: boolean) => {
  const cmd = new TestCommand(params, oclifConfigStub);
  stubMethod($$.SANDBOX, cmd, 'assignOrg').callsFake(() => {
    const orgStub = fromStub(
      stubInterface<Org>($$.SANDBOX, {
        getUsername: () => 'test@user.com',
        getConnection: () => ({
          getApiVersion: apiVersionStub,
          tooling: {
            query: queryStub,
          },
        }),
      })
    );
    cmd.setOrg(orgStub);
  });
  return cmd.runIt(confirm);
};

describe('force:package:install', () => {
  beforeEach(() => {
    apiVersionStub = $$.SANDBOX.stub().returns('55.0');
    queryStub = $$.SANDBOX.stub();
    getExternalSitesStub = $$.SANDBOX.stub();
    installStub = $$.SANDBOX.stub();
    waitForPublishStub = $$.SANDBOX.stub();

    // The Package class is tested in the packaging library, so
    // we just stub the public APIs used by the command.
    packageStub = $$.SANDBOX.stub().callsFake(() => ({
      getExternalSites: getExternalSitesStub,
      install: installStub,
      waitForPublish: waitForPublishStub,
    }));
    Object.setPrototypeOf(Package, packageStub);
  });
  afterEach(() => {
    $$.SANDBOX.restore();
  });

  it('should error without required --package param', async () => {
    try {
      await runCmd([]);
      expect(false, 'Expected required flag error').to.be.true;
    } catch (err) {
      const error = err as Error;
      expect(error.name).to.equal('Error');
      expect(error.message).to.include('Missing required flag package');
    }
  });

  it('should error with org API Version < 36.0', async () => {
    apiVersionStub.reset();
    apiVersionStub.returns('35.0');
    try {
      await runCmd(['-p', '04t6A000002zgKSQAY']);
      expect(false, 'Expected API version too low error').to.be.true;
    } catch (err) {
      const error = err as Error;
      expect(error.name).to.equal('ApiVersionTooLowError');
      expect(error.message).to.include('This command is supported only on API versions 36.0 and higher');
    }
  });

  it('should print IN_PROGRESS status correctly', async () => {
    installStub.resolves(pkgInstallRequest);
    const result = await runCmd(['-p', '04t6A000002zgKSQAY']);
    expect(uxLogStub.calledOnce).to.be.true;
    const msg = `PackageInstallRequest is currently InProgress. You can continue to query the status using${EOL}sfdx force:package:beta:install:report -i 0Hf1h0000006sh2CAA -u test@user.com`;
    expect(uxLogStub.args[0][0]).to.equal(msg);
    expect(result).to.deep.equal(pkgInstallRequest);
    expect(installStub.args[0][0]).to.deep.equal(pkgInstallCreateRequest);
  });

  it('should print SUCCESS status correctly', async () => {
    const request = Object.assign({}, pkgInstallRequest, { Status: 'SUCCESS' });
    installStub.resolves(request);
    const result = await runCmd(['-p', '04t6A000002zgKSQAY']);
    expect(uxLogStub.calledOnce).to.be.true;
    const msg = 'Successfully installed package [04t6A000002zgKSQAY]';
    expect(uxLogStub.args[0][0]).to.equal(msg);
    expect(result).to.deep.equal(request);
    expect(installStub.args[0][0]).to.deep.equal(pkgInstallCreateRequest);
  });

  it('should throw error for ERROR status and no install errors', async () => {
    const request = Object.assign({}, pkgInstallRequest, { Status: 'ERROR' });
    installStub.resolves(request);
    try {
      await runCmd(['-p', '04t6A000002zgKSQAY']);
      expect(false, 'Expected error to be thrown').to.be.true;
    } catch (err) {
      const error = err as Error;
      expect(error.name).to.equal('PackageInstallError');
      expect(error.message).to.equal('Encountered errors installing the package! <empty>');
    }
  });

  it('should throw error for ERROR status with install errors', async () => {
    const request = Object.assign({}, pkgInstallRequest, {
      Status: 'ERROR',
      Errors: { errors: [new Error('message 1'), new Error('message 2')] },
    });
    installStub.resolves(request);
    try {
      await runCmd(['-p', '04t6A000002zgKSQAY']);
      expect(false, 'Expected error to be thrown').to.be.true;
    } catch (err) {
      const error = err as Error;
      expect(error.name).to.equal('PackageInstallError');
      expect(error.message).to.equal(
        'Encountered errors installing the package! Installation errors: \n1) message 1\n2) message 2'
      );
    }
  });

  it('should throw ProjectNotFoundError', async () => {
    $$.SANDBOX.stub(SfProject, 'getInstance').throws('InvalidProjectWorkspaceError');
    try {
      await runCmd(['-p', 'my_package_alias']);
      expect(false, 'Expected ProjectNotFoundError to be thrown').to.be.true;
    } catch (err) {
      const error = err as Error;
      expect(error.name).to.equal('ProjectNotFoundError');
      expect(error.message).to.equal(
        'Could not find the sfdx-project.json for subscriber package version: [my_package_alias]'
      );
    }
  });

  it('should throw PackageAliasNotFoundError', async () => {
    try {
      await runCmd(['-p', 'my_package_alias']);
      expect(false, 'Expected ProjectNotFoundError to be thrown').to.be.true;
    } catch (err) {
      const error = err as Error;
      expect(error.name).to.equal('PackageAliasNotFoundError');
      expect(error.message).to.equal(
        "The subscriber package version alias: [my_package_alias] isn't defined in the sfdx-project.json."
      );
    }
  });

  it('should print SUCCESS status correctly for package alias', async () => {
    // Stubs SfProject.getInstance, SfProject.getSfProjectJson, and SfProjectJson.getContents
    // in a way that makes TS happy... all to test package aliases.
    const getContentsStub = stubMethod($$.SANDBOX, SfProjectJson.prototype, 'getContents').returns({
      packageAliases: { ['my_package_alias']: '04t6A000002zgKSQAY' },
    });
    const getSfProjectJsonStub = stubMethod($$.SANDBOX, SfProject.prototype, 'getSfProjectJson').callsFake(() => ({
      getContents: getContentsStub,
    }));
    stubMethod($$.SANDBOX, SfProject, 'getInstance').callsFake(() => ({ getSfProjectJson: getSfProjectJsonStub }));

    const request = Object.assign({}, pkgInstallRequest, { Status: 'SUCCESS' });

    installStub.resolves(request);
    const result = await runCmd(['-p', 'my_package_alias']);
    expect(uxLogStub.calledOnce).to.be.true;
    const msg = 'Successfully installed package [my_package_alias]';
    expect(uxLogStub.args[0][0]).to.equal(msg);
    expect(result).to.deep.equal(request);
    expect(installStub.args[0][0]).to.deep.equal(pkgInstallCreateRequest);
  });

  it('should use installation key as password', async () => {
    const installationkey = '1234abcd';
    const expectedCreateRequest = Object.assign({}, pkgInstallCreateRequest, { Password: installationkey });
    installStub.resolves(pkgInstallRequest);

    const result = await runCmd(['-p', '04t6A000002zgKSQAY', '-k', installationkey]);

    expect(result).to.deep.equal(pkgInstallRequest);
    expect(installStub.args[0][0]).to.deep.equal(expectedCreateRequest);
  });

  it('sets PackageInstallRequest values for securityType, upgradeType, apexCompileType', async () => {
    const overrides = {
      ApexCompileType: 'package',
      SecurityType: 'full',
      UpgradeType: 'deprecate-only',
    };
    const expectedCreateRequest = Object.assign({}, pkgInstallCreateRequest, overrides);
    installStub.resolves(pkgInstallRequest);

    const result = await runCmd([
      '-p',
      '04t6A000002zgKSQAY',
      '-a',
      overrides.ApexCompileType,
      '-s',
      'AllUsers',
      '-t',
      'DeprecateOnly',
    ]);

    expect(result).to.deep.equal(pkgInstallRequest);
    expect(installStub.args[0][0]).to.deep.equal(expectedCreateRequest);
  });

  it('should listen for PackageInstallRequest:warning events and log warnings', async () => {
    const warningMsg = 'test warning message';
    installStub.callsFake(async () => {
      await Lifecycle.getInstance().emit('Package/install-warning', warningMsg);
      return pkgInstallRequest;
    });

    const result = await runCmd(['-p', '04t6A000002zgKSQAY']);

    expect(uxLogStub.calledTwice).to.be.true;
    expect(uxLogStub.args[0][0]).to.equal(warningMsg);
    const msg = `PackageInstallRequest is currently InProgress. You can continue to query the status using${EOL}sfdx force:package:beta:install:report -i 0Hf1h0000006sh2CAA -u test@user.com`;
    expect(uxLogStub.args[1][0]).to.equal(msg);
    expect(result).to.deep.equal(pkgInstallRequest);
  });

  it('should listen for PackageInstallRequest:status polling events and log statuses', async () => {
    const successRequest = Object.assign({}, pkgInstallRequest, { Status: 'SUCCESS' });
    installStub.callsFake(async () => {
      await Lifecycle.getInstance().emit('Package/install-status', pkgInstallRequest);
      await Lifecycle.getInstance().emit('Package/install-status', successRequest);
      return pkgInstallRequest;
    });

    const result = await runCmd(['-p', '04t6A000002zgKSQAY', '-w', '1']);

    expect(uxLogStub.calledOnce).to.be.true;
    expect(uxSetSpinnerStatusStub.args[0][0]).to.equal(
      '1 minutes remaining until timeout. Install status: IN_PROGRESS'
    );
    expect(uxSetSpinnerStatusStub.args[1][0]).to.equal('1 minutes remaining until timeout. Install status: SUCCESS');
    expect(result).to.deep.equal(pkgInstallRequest);
  });

  describe('confirm upgrade type', () => {
    it('should NOT confirm UpgradeType with --noprompt flag', async () => {
      // stub the getPackageTypeBy04t() query to return an Unlocked package type
      queryStub.resolves({
        done: true,
        totalSize: 1,
        records: [{ Package2ContainerOptions: 'Unlocked' }],
      });
      installStub.resolves(pkgInstallRequest);

      const result = await runCmd(['-p', '04t6A000002zgKSQAY', '-t', 'Delete', '--noprompt'], true);

      expect(uxConfirmStub.calledOnce).to.be.false;
      expect(result).to.deep.equal(pkgInstallRequest);
    });

    it('should confirm UpgradeType when NO --noprompt flag', async () => {
      // stub the getPackageTypeBy04t() query to return an Unlocked package type
      queryStub.resolves({
        done: true,
        totalSize: 1,
        records: [{ Package2ContainerOptions: 'Unlocked' }],
      });
      installStub.resolves(pkgInstallRequest);

      const result = await runCmd(['-p', '04t6A000002zgKSQAY', '-t', 'Delete'], true);

      expect(uxConfirmStub.calledOnce).to.be.true;
      expect(result).to.deep.equal(pkgInstallRequest);
    });

    it('should confirm UpgradeType and throw with no consent', async () => {
      // stub the getPackageTypeBy04t() query to return an Unlocked package type
      queryStub.resolves({
        done: true,
        totalSize: 1,
        records: [{ Package2ContainerOptions: 'Unlocked' }],
      });
      installStub.resolves(pkgInstallRequest);

      try {
        await runCmd(['-p', '04t6A000002zgKSQAY', '-t', 'Delete'], false);
        expect(false, 'Expected PromptUpgradeTypeDenyError').to.be.true;
      } catch (err) {
        const error = err as Error;
        expect(error.name).to.equal('PromptUpgradeTypeDenyError');
        expect(error.message).to.include('We canceled this package installation per your request.');
        expect(uxConfirmStub.calledOnce).to.be.true;
      }
    });

    it('should NOT confirm UpgradeType with non-Unlocked packages', async () => {
      // stub the getPackageTypeBy04t() query to return an Unlocked package type
      queryStub.resolves({
        done: true,
        totalSize: 1,
        records: [{ Package2ContainerOptions: 'Managed' }],
      });
      installStub.resolves(pkgInstallRequest);

      const result = await runCmd(['-p', '04t6A000002zgKSQAY', '-t', 'Delete', '--noprompt'], true);

      expect(uxConfirmStub.calledOnce).to.be.false;
      expect(result).to.deep.equal(pkgInstallRequest);
    });
  });

  describe('confirm external sites', () => {
    const extSites = ['url/for/site1', 'url/for/site2'];

    it('should NOT confirm external sites with --noprompt flag', async () => {
      const expectedCreateRequest = Object.assign({}, pkgInstallCreateRequest, { EnableRss: true });
      getExternalSitesStub.resolves(extSites);
      installStub.resolves(pkgInstallRequest);

      const result = await runCmd(['-p', '04t6A000002zgKSQAY', '--noprompt'], true);

      expect(getExternalSitesStub.calledOnce).to.be.true;
      expect(uxConfirmStub.calledOnce).to.be.false;
      expect(installStub.args[0][0]).to.deep.equal(expectedCreateRequest);
      expect(result).to.deep.equal(pkgInstallRequest);
    });

    it('should NOT confirm external sites with --noprompt flag and installation key', async () => {
      const installationkey = '1234abcd';
      const expectedCreateRequest = Object.assign({}, pkgInstallCreateRequest, {
        EnableRss: true,
        Password: installationkey,
      });
      getExternalSitesStub.resolves(extSites);
      installStub.resolves(pkgInstallRequest);

      const result = await runCmd(['-p', '04t6A000002zgKSQAY', '--noprompt', '-k', installationkey], true);

      expect(getExternalSitesStub.calledOnce).to.be.true;
      expect(getExternalSitesStub.args[0][0]).to.equal(pkgInstallCreateRequest.SubscriberPackageVersionKey);
      expect(getExternalSitesStub.args[0][1]).to.equal(installationkey);
      expect(uxConfirmStub.calledOnce).to.be.false;
      expect(installStub.args[0][0]).to.deep.equal(expectedCreateRequest);
      expect(result).to.deep.equal(pkgInstallRequest);
    });

    it('should confirm external sites when NO --noprompt flag (yes answer)', async () => {
      const expectedCreateRequest = Object.assign({}, pkgInstallCreateRequest, { EnableRss: true });
      getExternalSitesStub.resolves(extSites);
      installStub.resolves(pkgInstallRequest);

      const result = await runCmd(['-p', '04t6A000002zgKSQAY'], true);

      expect(getExternalSitesStub.calledOnce).to.be.true;
      expect(uxConfirmStub.calledOnce).to.be.true;
      expect(uxConfirmStub.args[0][0]).to.include(extSites.join('\n'));
      expect(installStub.args[0][0]).to.deep.equal(expectedCreateRequest);
      expect(result).to.deep.equal(pkgInstallRequest);
    });

    it('should confirm external sites when NO --noprompt flag (no answer)', async () => {
      getExternalSitesStub.resolves(extSites);
      installStub.resolves(pkgInstallRequest);

      const result = await runCmd(['-p', '04t6A000002zgKSQAY'], false);

      expect(getExternalSitesStub.calledOnce).to.be.true;
      expect(uxConfirmStub.calledOnce).to.be.true;
      expect(uxConfirmStub.args[0][0]).to.include(extSites.join('\n'));
      expect(installStub.args[0][0]).to.deep.equal(pkgInstallCreateRequest);
      expect(result).to.deep.equal(pkgInstallRequest);
    });
  });

  describe('wait for publish', () => {
    it('should listen for SubscriberPackageVersion:status polling events and log statuses', async () => {
      waitForPublishStub.callsFake(async () => {
        await Lifecycle.getInstance().emit('Package/install-subscriber-status', 'PACKAGE_UNAVAILABLE');
        await Lifecycle.getInstance().emit('Package/install-subscriber-status', 'NO_ERRORS_DETECTED');
      });
      installStub.resolves(pkgInstallRequest);

      const result = await runCmd(['-p', '04t6A000002zgKSQAY', '--publishwait', '1']);

      expect(uxLogStub.calledThrice).to.be.true;
      expect(uxLogStub.args[0][0]).to.equal(
        'Waiting for the Subscriber Package Version ID to be published to the target org. Status = PACKAGE_UNAVAILABLE'
      );
      expect(uxLogStub.args[1][0]).to.equal(
        'Waiting for the Subscriber Package Version ID to be published to the target org. Status = NO_ERRORS_DETECTED'
      );
      expect(result).to.deep.equal(pkgInstallRequest);
    });

    it('should NOT throw error for UNINSTALL_IN_PROGRESS status on timeout error', async () => {
      const publishError = new SfError('TimeoutError');
      publishError.data = {
        done: true,
        totalSize: 1,
        records: [{ InstallValidationStatus: 'UNINSTALL_IN_PROGRESS' }],
      };
      waitForPublishStub.throws(publishError);
      installStub.resolves(pkgInstallRequest);

      const result = await runCmd(['-p', '04t6A000002zgKSQAY', '--publishwait', '1']);

      expect(uxLogStub.calledOnce).to.be.true;
      expect(result).to.deep.equal(pkgInstallRequest);
    });

    it('should throw error for any other status on timeout error', async () => {
      const publishError = new SfError('TimeoutError');
      publishError.data = {
        done: true,
        totalSize: 1,
        records: [{ InstallValidationStatus: 'PACKAGE_UNAVAILABLE' }],
      };
      waitForPublishStub.throws(publishError);
      installStub.resolves(pkgInstallRequest);

      try {
        await runCmd(['-p', '04t6A000002zgKSQAY', '--publishwait', '1']);
        expect(false, 'Expected TimeoutError').to.be.true;
      } catch (err) {
        const error = err as Error;
        expect(error.name).to.equal('SfError');
      }
    });
  });
});
