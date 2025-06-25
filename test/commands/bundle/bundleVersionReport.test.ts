/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Config } from '@oclif/core';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { PackageBundleVersion, BundleSObjects, PackagingSObjects } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import sinon from 'sinon';
import { PackageBundleVersionReportCommand } from '../../../src/commands/package/bundle/version/report.js';

describe('package:bundle:version:report - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let reportStub: sinon.SinonStub;
  let componentPackagesStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);

    reportStub = $$.SANDBOX.stub(PackageBundleVersion, 'report');
    componentPackagesStub = $$.SANDBOX.stub(PackageBundleVersion, 'componentPackages');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should report on a package bundle version', async () => {
    const bundleVersionId = '0Ho0x0000000000000';
    const mockBundleVersion: BundleSObjects.BundleVersion = {
      Id: bundleVersionId,
      IsReleased: false,
      PackageBundle: {
        Id: '0Ho0x0000000000001',
        BundleName: 'Test Bundle',
        Description: 'Test bundle description',
        IsDeleted: false,
        CreatedDate: '2025-01-01T00:00:00.000+0000',
        CreatedById: '0050x0000000000001',
        LastModifiedDate: '2025-01-01T00:00:00.000+0000',
        LastModifiedById: '0050x0000000000001',
        SystemModstamp: '2025-01-01T00:00:00.000+0000',
      },
      VersionName: '1.0.0',
      MajorVersion: '1',
      MinorVersion: '0',
      CreatedDate: '2025-01-01T00:00:00.000+0000',
      CreatedById: '0050x0000000000001',
      LastModifiedDate: '2025-01-01T00:00:00.000+0000',
      LastModifiedById: '0050x0000000000001',
      Ancestor: null,
    };

    const mockComponentPackages: PackagingSObjects.SubscriberPackageVersion[] = [
      {
        Id: '04t0000000000001',
        Name: 'Test Package 1',
        MajorVersion: 1,
        MinorVersion: 0,
        PatchVersion: 0,
        BuildNumber: 1,
        SubscriberPackageId: '0330000000000001',
        Description: 'Test package 1 description',
        PublisherName: 'Test Publisher',
        IsDeprecated: false,
        IsPasswordProtected: false,
        IsBeta: false,
        IsOrgDependent: false,
        Package2ContainerOptions: 'Managed',
        IsSecurityReviewed: true,
        ReleaseState: 'Released',
        IsManaged: true,
        AppExchangePackageName: 'Test Package 1',
        AppExchangeDescription: 'Test package 1 description',
        AppExchangePublisherName: 'Test Publisher',
        AppExchangeLogoUrl: 'https://test.com/logo1.png',
        ReleaseNotesUrl: 'https://test.com/releasenotes1',
        PostInstallUrl: 'https://test.com/postinstall1',
        RemoteSiteSettings: { settings: [] },
        CspTrustedSites: { settings: [] },
        Profiles: { destinationProfiles: [], sourceProfiles: [] },
        Dependencies: { ids: [] },
        InstallValidationStatus: 'NO_ERRORS_DETECTED',
      },
      {
        Id: '04t0000000000002',
        Name: 'Test Package 2',
        MajorVersion: 2,
        MinorVersion: 0,
        PatchVersion: 0,
        BuildNumber: 1,
        SubscriberPackageId: '0330000000000002',
        Description: 'Test package 2 description',
        PublisherName: 'Test Publisher',
        IsDeprecated: false,
        IsPasswordProtected: false,
        IsBeta: false,
        IsOrgDependent: false,
        Package2ContainerOptions: 'Managed',
        IsSecurityReviewed: true,
        ReleaseState: 'Released',
        IsManaged: true,
        AppExchangePackageName: 'Test Package 2',
        AppExchangeDescription: 'Test package 2 description',
        AppExchangePublisherName: 'Test Publisher',
        AppExchangeLogoUrl: 'https://test.com/logo2.png',
        ReleaseNotesUrl: 'https://test.com/releasenotes2',
        PostInstallUrl: 'https://test.com/postinstall2',
        RemoteSiteSettings: { settings: [] },
        CspTrustedSites: { settings: [] },
        Profiles: { destinationProfiles: [], sourceProfiles: [] },
        Dependencies: { ids: [] },
        InstallValidationStatus: 'NO_ERRORS_DETECTED',
      },
    ];

    reportStub.resolves(mockBundleVersion);
    componentPackagesStub.resolves(mockComponentPackages);

    const cmd = new PackageBundleVersionReportCommand(
      ['--bundle-version', bundleVersionId, '--target-dev-hub', testOrg.username],
      config
    );

    await cmd.run();

    expect(reportStub.calledOnce).to.be.true;
    expect(reportStub.firstCall.args[1]).to.equal(bundleVersionId);
    expect(componentPackagesStub.calledOnce).to.be.true;
    expect(componentPackagesStub.firstCall.args[1]).to.equal(bundleVersionId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledTwice).to.be.true;
  });

  it('should report on a package bundle version with verbose output', async () => {
    const bundleVersionId = '0Ho0x0000000000000';
    const mockBundleVersion: BundleSObjects.BundleVersion = {
      Id: bundleVersionId,
      IsReleased: true,
      PackageBundle: {
        Id: '0Ho0x0000000000001',
        BundleName: 'Test Bundle',
        Description: 'Test bundle description',
        IsDeleted: false,
        CreatedDate: '2025-01-01T00:00:00.000+0000',
        CreatedById: '0050x0000000000001',
        LastModifiedDate: '2025-01-01T00:00:00.000+0000',
        LastModifiedById: '0050x0000000000001',
        SystemModstamp: '2025-01-01T00:00:00.000+0000',
      },
      VersionName: '2.0.0',
      MajorVersion: '2',
      MinorVersion: '0',
      CreatedDate: '2025-01-01T00:00:00.000+0000',
      CreatedById: '0050x0000000000001',
      LastModifiedDate: '2025-01-01T00:00:00.000+0000',
      LastModifiedById: '0050x0000000000001',
      Ancestor: {
        Id: '0Ho0x0000000000001',
        PackageBundle: {
          Id: '0Ho0x0000000000002',
          BundleName: 'Test Bundle',
          Description: 'Test bundle description',
          IsDeleted: false,
          CreatedDate: '2025-01-01T00:00:00.000+0000',
          CreatedById: '0050x0000000000001',
          LastModifiedDate: '2025-01-01T00:00:00.000+0000',
          LastModifiedById: '0050x0000000000001',
          SystemModstamp: '2025-01-01T00:00:00.000+0000',
        },
        VersionName: '1.0.0',
        MajorVersion: '1',
        MinorVersion: '0',
        IsReleased: true,
        CreatedDate: '2025-01-01T00:00:00.000+0000',
        CreatedById: '0050x0000000000001',
        LastModifiedDate: '2025-01-01T00:00:00.000+0000',
        LastModifiedById: '0050x0000000000001',
        Ancestor: null,
      },
    };

    const mockComponentPackages: PackagingSObjects.SubscriberPackageVersion[] = [
      {
        Id: '04t0000000000001',
        Name: 'Test Package 1',
        MajorVersion: 1,
        MinorVersion: 0,
        PatchVersion: 0,
        BuildNumber: 1,
        SubscriberPackageId: '0330000000000001',
        Description: 'Test package 1 description',
        PublisherName: 'Test Publisher',
        IsDeprecated: false,
        IsPasswordProtected: false,
        IsBeta: false,
        IsOrgDependent: false,
        Package2ContainerOptions: 'Managed',
        IsSecurityReviewed: true,
        ReleaseState: 'Released',
        IsManaged: true,
        AppExchangePackageName: 'Test Package 1',
        AppExchangeDescription: 'Test package 1 description',
        AppExchangePublisherName: 'Test Publisher',
        AppExchangeLogoUrl: 'https://test.com/logo1.png',
        ReleaseNotesUrl: 'https://test.com/releasenotes1',
        PostInstallUrl: 'https://test.com/postinstall1',
        RemoteSiteSettings: { settings: [] },
        CspTrustedSites: { settings: [] },
        Profiles: { destinationProfiles: [], sourceProfiles: [] },
        Dependencies: { ids: [] },
        InstallValidationStatus: 'NO_ERRORS_DETECTED',
      },
    ];

    reportStub.resolves(mockBundleVersion);
    componentPackagesStub.resolves(mockComponentPackages);

    const cmd = new PackageBundleVersionReportCommand(
      ['--bundle-version', bundleVersionId, '--target-dev-hub', testOrg.username, '--verbose'],
      config
    );

    await cmd.run();

    expect(reportStub.calledOnce).to.be.true;
    expect(reportStub.firstCall.args[1]).to.equal(bundleVersionId);
    expect(componentPackagesStub.calledOnce).to.be.true;
    expect(componentPackagesStub.firstCall.args[1]).to.equal(bundleVersionId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledTwice).to.be.true;
  });

  it('should throw error when bundle-version flag is missing', async () => {
    const cmd = new PackageBundleVersionReportCommand(['--target-dev-hub', testOrg.username], config);

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include('Missing required flag');
    }
  });

  it('should throw error when target-dev-hub flag is missing', async () => {
    const bundleVersionId = '0Ho0x0000000000000';
    const cmd = new PackageBundleVersionReportCommand(['--bundle-version', bundleVersionId], config);

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include('No default dev hub found');
    }
  });

  it('should handle API errors gracefully', async () => {
    const bundleVersionId = '0Ho0x0000000000000';
    const errorMessage = 'Package bundle version not found';

    reportStub.rejects(new Error(errorMessage));

    const cmd = new PackageBundleVersionReportCommand(
      ['--bundle-version', bundleVersionId, '--target-dev-hub', testOrg.username],
      config
    );

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include(errorMessage);
    }
  });

  it('should handle case when no bundle version is found', async () => {
    const bundleVersionId = '0Ho0x0000000000000';

    reportStub.resolves(null);

    const cmd = new PackageBundleVersionReportCommand(
      ['--bundle-version', bundleVersionId, '--target-dev-hub', testOrg.username],
      config
    );

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include(`No bundle version found with ID: ${bundleVersionId}`);
    }
  });

  it('should handle case when no component packages are found', async () => {
    const bundleVersionId = '0Ho0x0000000000000';
    const mockBundleVersion: BundleSObjects.BundleVersion = {
      Id: bundleVersionId,
      IsReleased: false,
      PackageBundle: {
        Id: '0Ho0x0000000000001',
        BundleName: 'Test Bundle',
        Description: 'Test bundle description',
        IsDeleted: false,
        CreatedDate: '2025-01-01T00:00:00.000+0000',
        CreatedById: '0050x0000000000001',
        LastModifiedDate: '2025-01-01T00:00:00.000+0000',
        LastModifiedById: '0050x0000000000001',
        SystemModstamp: '2025-01-01T00:00:00.000+0000',
      },
      VersionName: '1.0.0',
      MajorVersion: '1',
      MinorVersion: '0',
      CreatedDate: '2025-01-01T00:00:00.000+0000',
      CreatedById: '0050x0000000000001',
      LastModifiedDate: '2025-01-01T00:00:00.000+0000',
      LastModifiedById: '0050x0000000000001',
      Ancestor: null,
    };

    const mockComponentPackages: PackagingSObjects.SubscriberPackageVersion[] = [];

    reportStub.resolves(mockBundleVersion);
    componentPackagesStub.resolves(mockComponentPackages);

    const cmd = new PackageBundleVersionReportCommand(
      ['--bundle-version', bundleVersionId, '--target-dev-hub', testOrg.username],
      config
    );

    await cmd.run();

    expect(reportStub.calledOnce).to.be.true;
    expect(reportStub.firstCall.args[1]).to.equal(bundleVersionId);
    expect(componentPackagesStub.calledOnce).to.be.true;
    expect(componentPackagesStub.firstCall.args[1]).to.equal(bundleVersionId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledOnce).to.be.true;
  });
});
