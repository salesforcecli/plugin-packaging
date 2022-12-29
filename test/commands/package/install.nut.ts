/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { PackagingSObjects } from '@salesforce/packaging';
import { Duration } from '@salesforce/kit';

type PackageInstallRequest = PackagingSObjects.PackageInstallRequest;
type PackageUninstallRequest = PackagingSObjects.SubscriberPackageVersionUninstallRequest;

describe('package install', () => {
  let session: TestSession;
  before(async () => {
    session = await TestSession.create({
      devhubAuthStrategy: 'AUTO',
      scratchOrgs: [
        {
          executable: 'sfdx',
          duration: 1,
          setDefault: true,
          config: path.join('config', 'project-scratch-def.json'),
        },
      ],
      project: { name: 'packageInstall' },
    });
  });

  after(async () => {
    await session?.clean();
  });

  it('should install ElectronBranding package with polling', () => {
    const command = 'force:package:beta:install -p 04t6A000002zgKSQAY -w 20';
    const output = execCmd(command, { ensureExitCode: 0, timeout: Duration.minutes(20).milliseconds }).shellOutput
      .stdout;
    expect(output).to.contain('Successfully installed package');
  });

  it('should install DFXP Escape Room package (async) and report', () => {
    const installCommand = 'force:package:beta:install -p 04t6A000002zgKSQAY --json';
    const installJson = execCmd<PackageInstallRequest>(installCommand, { ensureExitCode: 0 }).jsonOutput?.result;
    expect(installJson).to.have.property('Status', 'IN_PROGRESS');

    const reportCommand = `force:package:beta:install:report -i ${installJson?.Id} --json`;
    const reportJson = execCmd<PackageInstallRequest>(reportCommand, { ensureExitCode: 0 }).jsonOutput?.result;
    expect(reportJson).to.have.property('Status');
    expect(['IN_PROGRESS', 'SUCCESS']).to.include(reportJson?.Status);
  });

  it('should start an uninstall request, and report on it', () => {
    const uninstallCommand = 'force:package:beta:uninstall -p 04t6A000002zgKSQAY --json -w 0';
    const uninstallRequest = execCmd<PackageUninstallRequest>(uninstallCommand, {
      ensureExitCode: 0,
    }).jsonOutput?.result;
    expect(['InProgress', 'Success']).to.include(uninstallRequest?.Status);
    expect(uninstallRequest?.Id.startsWith('06y')).to.be.true;

    const uninstallReportCommand = `force:package:beta:uninstall:report -i ${uninstallRequest?.Id} --json`;
    const uninstallReportResult = execCmd(uninstallReportCommand, { ensureExitCode: 0 }).jsonOutput?.result;
    expect(uninstallReportResult).to.have.all.keys(
      'Id',
      'IsDeleted',
      'CreatedDate',
      'CreatedById',
      'LastModifiedDate',
      'LastModifiedById',
      'SystemModstamp',
      'SubscriberPackageVersionId',
      'Status',
      'attributes'
    );
  });
});
