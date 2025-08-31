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

import path from 'node:path';
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
    const command = 'package:install -p 04t6A000002zgKSQAY -w 20';
    const output = execCmd(command, { ensureExitCode: 0, timeout: Duration.minutes(20).milliseconds }).shellOutput
      .stdout;
    expect(output).to.contain('Successfully installed package');
  });

  it('should install DFXP Escape Room package (async) and report', () => {
    const installCommand = 'package:install -p 04t6A000002zgKSQAY --json';
    const installJson = execCmd<PackageInstallRequest>(installCommand, { ensureExitCode: 0 }).jsonOutput?.result;
    expect(installJson).to.have.property('Status', 'IN_PROGRESS');

    const reportCommand = `package:install:report -i ${installJson?.Id} --json`;
    const reportJson = execCmd<PackageInstallRequest>(reportCommand, { ensureExitCode: 0 }).jsonOutput?.result;
    expect(reportJson).to.have.property('Status');
    expect(['IN_PROGRESS', 'SUCCESS']).to.include(reportJson?.Status);
  });

  it('should start an uninstall request, and report on it', () => {
    const uninstallCommand = 'package:uninstall -p 04t6A000002zgKSQAY --json -w 0';
    const uninstallRequest = execCmd<PackageUninstallRequest>(uninstallCommand, {
      ensureExitCode: 0,
    }).jsonOutput?.result;
    expect(['InProgress', 'Success']).to.include(uninstallRequest?.Status);
    expect(uninstallRequest?.Id.startsWith('06y')).to.be.true;

    const uninstallReportCommand = `package:uninstall:report -i ${uninstallRequest?.Id} --json`;
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
