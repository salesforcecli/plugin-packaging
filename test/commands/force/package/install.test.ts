/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { EOL } from 'os';
import { Connection, Lifecycle, Org, SfError, SfProject, SfProjectJson } from '@salesforce/core';
import { TestContext } from '@salesforce/core/lib/testSetup';
import { fromStub, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { PackageEvents, PackagingSObjects, SubscriberPackageVersion } from '@salesforce/packaging';
import { Result } from '@salesforce/command';
import { Install } from '../../../../src/commands/force/package/install';
import InstallValidationStatus = PackagingSObjects.InstallValidationStatus;

const myPackageVersion04t = '04t6A000002zgKSQAY';

describe('force:package:install', () => {
  const $$ = new TestContext();

  const oclifConfigStub = fromStub(stubInterface<Config>($$.SANDBOX));
  let uxLogStub: sinon.SinonStub;
  let uxSetSpinnerStatusStub: sinon.SinonStub;
  let uxStopSpinnerStub: sinon.SinonStub;
  let uxConfirmStub: sinon.SinonStub;
  let apiVersionStub: sinon.SinonStub;
  let queryStub: sinon.SinonStub;
  let packageVersionStub: sinon.SinonStub;
  let getExternalSitesStub: sinon.SinonStub;
  let installStub: sinon.SinonStub;
  let installStatusStub: sinon.SinonStub;

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
    SubscriberPackageVersionKey: myPackageVersion04t,
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
    SubscriberPackageVersionKey: myPackageVersion04t,
    Password: undefined,
    ApexCompileType: 'all',
    SecurityType: 'none',
    UpgradeType: 'mixed-mode',
  };

  const subscriberPackageVersion: PackagingSObjects.SubscriberPackageVersion = {
    AppExchangeDescription: '',
    AppExchangeLogoUrl: '',
    AppExchangePackageName: '',
    AppExchangePublisherName: '',
    BuildNumber: 0,
    CspTrustedSites: undefined,
    Dependencies: undefined,
    Description: '',
    Id: myPackageVersion04t,
    InstallValidationStatus: 'NO_ERRORS_DETECTED',
    IsBeta: false,
    IsDeprecated: false,
    IsManaged: false,
    IsOrgDependent: false,
    IsPasswordProtected: false,
    IsSecurityReviewed: false,
    MajorVersion: 0,
    MinorVersion: 0,
    Name: '',
    Package2ContainerOptions: undefined,
    PatchVersion: 0,
    PostInstallUrl: '',
    Profiles: undefined,
    PublisherName: '',
    ReleaseNotesUrl: '',
    ReleaseState: '',
    RemoteSiteSettings: undefined,
    SubscriberPackageId: '',
  };

  class TestCommand extends Install {
    public async runIt(confirm: boolean) {
      this.result = new Result(this.statics.result);
      await this.init();
      uxLogStub = stubMethod($$.SANDBOX, this.ux, 'log');
      stubMethod($$.SANDBOX, this.ux, 'logJson');
      uxSetSpinnerStatusStub = stubMethod($$.SANDBOX, this.ux, 'setSpinnerStatus');
      stubMethod($$.SANDBOX, this.ux, 'startSpinner');
      uxStopSpinnerStub = stubMethod($$.SANDBOX, this.ux, 'stopSpinner');
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
            singleRecordQuery: queryStub,
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
      installStatusStub = $$.SANDBOX.stub();

      // The SubscriberPackageVersion class is tested in the packaging library, so
      // we just stub the public APIs used by the command.
      packageVersionStub = $$.SANDBOX.stub().callsFake(() => ({
        install: installStub,
        getInstallStatus: installStatusStub,
      }));
      Object.setPrototypeOf(SubscriberPackageVersion, packageVersionStub);
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
        await runCmd(['-p', myPackageVersion04t]);
        expect(false, 'Expected API version too low error').to.be.true;
      } catch (err) {
        const error = err as Error;
        expect(error.name).to.equal('ApiVersionTooLowError');
        expect(error.message).to.include('This command is supported only on API versions 36.0 and higher');
      }
    });

    it('should print IN_PROGRESS status correctly', async () => {
      installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(pkgInstallRequest);
      queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves(subscriberPackageVersion);
      const result = await runCmd(['-p', myPackageVersion04t]);
      expect(uxLogStub.calledOnce).to.be.true;
      const msg = `PackageInstallRequest is currently InProgress. You can continue to query the status using${EOL}sfdx force:package:install:report -i 0Hf1h0000006sh2CAA -u test@user.com`;
      expect(uxLogStub.args[0][0]).to.equal(msg);
      expect(result).to.deep.equal(pkgInstallRequest);
      expect(installStub.args[0][0]).to.deep.equal(pkgInstallCreateRequest);
    });

    it('should print IN_PROGRESS status when timed out', async () => {
      const error = new SfError('polling timed out', 'PackageInstallTimeout');
      error.setData(pkgInstallRequest);
      installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').throws(error);
      queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves(subscriberPackageVersion);
      const result = await runCmd(['-p', myPackageVersion04t]);
      expect(uxLogStub.calledOnce).to.be.true;
      const msg = `PackageInstallRequest is currently InProgress. You can continue to query the status using${EOL}sfdx force:package:install:report -i 0Hf1h0000006sh2CAA -u test@user.com`;
      expect(uxLogStub.args[0][0]).to.equal(msg);
      expect(result).to.deep.equal(pkgInstallRequest);
      expect(installStub.args[0][0]).to.deep.equal(pkgInstallCreateRequest);
      expect(uxStopSpinnerStub.args[0][0]).to.equal('Polling timeout exceeded');
    });

    it('should return PackageInstallRequest when polling timed out with --json', async () => {
      const error = new SfError('polling timed out', 'PackageInstallTimeout');
      error.setData(pkgInstallRequest);
      installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').throws(error);
      queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves(subscriberPackageVersion);
      const result = await runCmd(['-p', myPackageVersion04t, '--json']);
      expect(result).to.deep.equal(pkgInstallRequest);
      expect(installStub.args[0][0]).to.deep.equal(pkgInstallCreateRequest);
    });

    it('should print SUCCESS status correctly', async () => {
      const request = Object.assign({}, pkgInstallRequest, { Status: 'SUCCESS' });
      installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(request);
      queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves(subscriberPackageVersion);
      const result = await runCmd(['-p', myPackageVersion04t]);
      expect(uxLogStub.calledOnce).to.be.true;
      const msg = 'Successfully installed package [04t6A000002zgKSQAY]';
      expect(uxLogStub.args[0][0]).to.equal(msg);
      expect(result).to.deep.equal(request);
      expect(installStub.args[0][0]).to.deep.equal(pkgInstallCreateRequest);
    });

    it('should throw error for ERROR status and no install errors', async () => {
      const request = Object.assign({}, pkgInstallRequest, { Status: 'ERROR' });
      installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(request);
      queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves(subscriberPackageVersion);
      try {
        await runCmd(['-p', myPackageVersion04t]);
        expect.fail('Expected error to be thrown');
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
      installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(request);
      queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves(subscriberPackageVersion);
      try {
        await runCmd(['-p', myPackageVersion04t]);
        expect.fail('Expected error to be thrown');
      } catch (err) {
        const error = err as Error;
        expect(error.name).to.equal('PackageInstallError');
        expect(error.message).to.equal(
          'Encountered errors installing the package! Installation errors: \n1) message 1\n2) message 2'
        );
      }
    });

    it('should throw PackageAliasNotFoundError', async () => {
      try {
        await runCmd(['-p', 'my_package_alias']);
        expect.fail('Expected InvalidAliasOrIdError to be thrown');
      } catch (err) {
        const error = err as Error;
        expect(error.name).to.equal('ErrorInvalidAliasOrIdError');
        expect(error.message).to.equal(
          'Invalid alias or ID: my_package_alias. Either your alias is invalid or undefined, or the ID (04t) provided is invalid.'
        );
      }
    });

    // TODO: It seems that while linking @salesforce/packaging into the plugin
    // we cannot stub the library calls of `SfProject.getInstance` e.g. "SfProject, 'getInstance'"
    // once the library has been published, the stubs resume to work and this test will pass
    it('should print SUCCESS status correctly for package alias', async () => {
      // Stubs SfProject.getInstance, SfProject.getSfProjectJson, and SfProjectJson.getContents
      // in a way that makes TS happy... all to test package aliases.
      const getContentsStub = stubMethod($$.SANDBOX, SfProjectJson.prototype, 'getContents').returns({
        packageAliases: { ['my_package_alias']: myPackageVersion04t },
      });
      const getSfProjectJsonStub = stubMethod($$.SANDBOX, SfProject.prototype, 'getSfProjectJson').callsFake(() => ({
        getContents: getContentsStub,
      }));
      const getPackageIdFromAliasStub = stubMethod($$.SANDBOX, SfProject.prototype, 'getPackageIdFromAlias').returns(
        myPackageVersion04t
      );
      stubMethod($$.SANDBOX, SfProject, 'getInstance').callsFake(() => ({
        getSfProjectJson: getSfProjectJsonStub,
        getPackageIdFromAlias: getPackageIdFromAliasStub,
      }));

      const request = Object.assign({}, pkgInstallRequest, { Status: 'SUCCESS' });
      installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(request);
      queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves(subscriberPackageVersion);
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
      installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(pkgInstallRequest);
      queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves(subscriberPackageVersion);

      const result = await runCmd(['-p', myPackageVersion04t, '-k', installationkey]);

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
      installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(pkgInstallRequest);
      queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves(subscriberPackageVersion);

      const result = await runCmd([
        '-p',
        myPackageVersion04t,
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
      installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').callsFake(async () => {
        await Lifecycle.getInstance().emit(PackageEvents.install.warning, warningMsg);
        return pkgInstallRequest;
      });
      queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves(subscriberPackageVersion);

      const result = await runCmd(['-p', myPackageVersion04t]);

      expect(uxLogStub.calledTwice).to.be.true;
      expect(uxLogStub.args[0][0]).to.equal(warningMsg);
      const msg = `PackageInstallRequest is currently InProgress. You can continue to query the status using${EOL}sfdx force:package:install:report -i 0Hf1h0000006sh2CAA -u test@user.com`;
      expect(uxLogStub.args[1][0]).to.equal(msg);
      expect(result).to.deep.equal(pkgInstallRequest);
    });

    it('should listen for Package/install-status polling events and log statuses', async () => {
      const successRequest = Object.assign({}, pkgInstallRequest, { Status: 'SUCCESS' });
      installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').callsFake(async () => {
        await Lifecycle.getInstance().emit(PackageEvents.install.status, pkgInstallRequest);
        await Lifecycle.getInstance().emit(PackageEvents.install.status, successRequest);
        return pkgInstallRequest;
      });
      queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves(subscriberPackageVersion);

      const result = await runCmd(['-p', myPackageVersion04t, '-w', '1']);

      expect(uxLogStub.calledOnce).to.be.true;
      expect(uxSetSpinnerStatusStub.args[0][0]).to.equal(
        '1 minutes remaining until timeout. Install status: IN_PROGRESS'
      );
      expect(uxSetSpinnerStatusStub.args[1][0]).to.equal('1 minutes remaining until timeout. Install status: SUCCESS');
      expect(result).to.deep.equal(pkgInstallRequest);
    });

    it('should listen for Package/install-status and Package/install/subscriber-status polling events and log statuses', async () => {
      const successRequest = Object.assign({}, pkgInstallRequest, { Status: 'SUCCESS' });
      installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').callsFake(async () => {
        await Lifecycle.getInstance().emit(
          PackageEvents.install['subscriber-status'],
          'PACKAGE_UNAVAILABLE' as InstallValidationStatus
        );
        await Lifecycle.getInstance().emit(
          PackageEvents.install['subscriber-status'],
          'NO_ERRORS_DETECTED' as InstallValidationStatus
        );
        await Lifecycle.getInstance().emit(PackageEvents.install.status, pkgInstallRequest);
        await Lifecycle.getInstance().emit(PackageEvents.install.status, successRequest);
        return pkgInstallRequest;
      });
      queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves(subscriberPackageVersion);

      const result = await runCmd(['-p', myPackageVersion04t, '-w', '1', '-b', '1']);

      expect(uxLogStub.calledOnce).to.be.true;
      expect(uxSetSpinnerStatusStub.callCount).to.equal(4);
      expect(uxSetSpinnerStatusStub.args[0][0]).to.equal(
        '1 minutes remaining until timeout. Publish status: Unavailable for installation'
      );
      expect(uxSetSpinnerStatusStub.args[1][0]).to.equal(
        '1 minutes remaining until timeout. Publish status: Available for installation'
      );
      expect(uxSetSpinnerStatusStub.args[2][0]).to.equal(
        '1 minutes remaining until timeout. Install status: IN_PROGRESS'
      );
      expect(uxSetSpinnerStatusStub.args[3][0]).to.equal('1 minutes remaining until timeout. Install status: SUCCESS');
      expect(result).to.deep.equal(pkgInstallRequest);
    });

    describe('confirm upgrade type', () => {
      it('should NOT confirm UpgradeType with --noprompt flag', async () => {
        installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(pkgInstallRequest);
        queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves({
          ...subscriberPackageVersion,
          Package2ContainerOptions: 'Unlocked',
        });

        const result = await runCmd(['-p', myPackageVersion04t, '-t', 'Delete', '--noprompt'], true);

        expect(uxConfirmStub.calledOnce).to.be.false;
        expect(result).to.deep.equal(pkgInstallRequest);
      });

      it('should confirm UpgradeType when NO --noprompt flag', async () => {
        installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(pkgInstallRequest);
        queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves({
          ...subscriberPackageVersion,
          Package2ContainerOptions: 'Unlocked',
        });

        const result = await runCmd(['-p', myPackageVersion04t, '-t', 'Delete'], true);

        expect(uxConfirmStub.calledOnce).to.be.true;
        expect(result).to.deep.equal(pkgInstallRequest);
      });

      it('should confirm UpgradeType and throw with no consent', async () => {
        installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(pkgInstallRequest);
        queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves({
          ...subscriberPackageVersion,
          Package2ContainerOptions: 'Unlocked',
        });

        try {
          await runCmd(['-p', myPackageVersion04t, '-t', 'Delete'], false);
          expect(false, 'Expected PromptUpgradeTypeDenyError').to.be.true;
        } catch (err) {
          const error = err as Error;
          expect(error.name).to.equal('PromptUpgradeTypeDenyError');
          expect(error.message).to.include('We canceled this package installation per your request.');
          expect(uxConfirmStub.calledOnce).to.be.true;
        }
      });

      it('should NOT confirm UpgradeType with non-Unlocked packages', async () => {
        installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(pkgInstallRequest);
        queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves({
          ...subscriberPackageVersion,
          Package2ContainerOptions: 'Managed',
        });

        const result = await runCmd(['-p', myPackageVersion04t, '-t', 'Delete', '--noprompt'], true);

        expect(uxConfirmStub.calledOnce).to.be.false;
        expect(result).to.deep.equal(pkgInstallRequest);
      });
    });

    describe('confirm external sites', () => {
      const extSites = ['url/for/site1', 'url/for/site2'];

      it('should NOT confirm external sites with --noprompt flag', async () => {
        const expectedCreateRequest = Object.assign({}, pkgInstallCreateRequest, { EnableRss: true });
        getExternalSitesStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'getExternalSites').resolves(
          extSites
        );
        installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(pkgInstallRequest);

        const result = await runCmd(['-p', myPackageVersion04t, '--noprompt'], true);

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
        installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(pkgInstallRequest);
        queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves({
          ...subscriberPackageVersion,
          RemoteSiteSettings: { settings: ['url/for/site1'] },
          CspTrustedSites: { settings: ['url/for/site2'] },
        });

        const result = await runCmd(['-p', myPackageVersion04t, '--noprompt', '-k', installationkey], true);

        expect(uxConfirmStub.calledOnce).to.be.false;
        expect(installStub.args[0][0]).to.deep.equal(expectedCreateRequest);
        expect(result).to.deep.equal(pkgInstallRequest);
      });

      it('should confirm external sites when NO --noprompt flag (yes answer)', async () => {
        const expectedCreateRequest = Object.assign({}, pkgInstallCreateRequest, { EnableRss: true });
        installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(pkgInstallRequest);
        queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves({
          ...subscriberPackageVersion,
          RemoteSiteSettings: { settings: [{ url: 'url/for/site1' }] },
          CspTrustedSites: { settings: [{ endpointUrl: 'url/for/site2' }] },
        });

        const result = await runCmd(['-p', myPackageVersion04t], true);

        expect(uxConfirmStub.calledOnce).to.be.true;
        expect(uxConfirmStub.args[0][0]).to.include(extSites.join('\n'));
        expect(installStub.args[0][0]).to.deep.equal(expectedCreateRequest);
        expect(result).to.deep.equal(pkgInstallRequest);
      });

      it('should confirm external sites when NO --noprompt flag (no answer)', async () => {
        installStub = stubMethod($$.SANDBOX, SubscriberPackageVersion.prototype, 'install').resolves(pkgInstallRequest);
        queryStub = stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery').resolves({
          ...subscriberPackageVersion,
          RemoteSiteSettings: { settings: [{ url: 'url/for/site1' }] },
          CspTrustedSites: { settings: [{ endpointUrl: 'url/for/site2' }] },
        });

        const result = await runCmd(['-p', myPackageVersion04t], false);

        expect(uxConfirmStub.calledOnce).to.be.true;
        expect(uxConfirmStub.args[0][0]).to.include(extSites.join('\n'));
        expect(installStub.args[0][0]).to.deep.equal(pkgInstallCreateRequest);
        expect(result).to.deep.equal(pkgInstallRequest);
      });
    });
  });
});
