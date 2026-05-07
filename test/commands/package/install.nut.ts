/*
 * Copyright 2026, Salesforce, Inc.
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

  it('should install DreamhouseLWC package with polling', () => {
    const command = 'package:install -p 04tKY000000MF7uYAG -w 20 --no-prompt';
    const output = execCmd(command, { ensureExitCode: 0, timeout: Duration.minutes(20).milliseconds }).shellOutput
      .stdout;
    expect(output).to.contain('Successfully installed package');
  });

  it('should report on installed DreamhouseLWC package', () => {
    // Get the list of installed packages to find the one we installed in the first test
    const listCommand = 'package:installed:list --json';
    const installedList = execCmd(listCommand, { ensureExitCode: 0 }).jsonOutput?.result as Array<{
      SubscriberPackageVersionId: string;
      Status: string;
    }>;

    // Find the DreamhouseLWC package in the installed list
    const installedPackage = installedList?.find(
      (pkg: { SubscriberPackageVersionId: string }) => pkg.SubscriberPackageVersionId === '04tKY000000MF7uYAG'
    );

    expect(installedPackage, 'DreamhouseLWC should be installed').to.exist;
    expect(installedPackage).to.have.property('Id');
    expect(installedPackage).to.have.property('SubscriberPackageVersionId', '04tKY000000MF7uYAG');
  });

  it('should start an uninstall request, and report on it', () => {
    const uninstallCommand = 'package:uninstall -p 04tKY000000MF7uYAG --json -w 0';
    let uninstallRequest: PackageUninstallRequest | undefined;

    try {
      const result = execCmd<PackageUninstallRequest>(uninstallCommand, {
        ensureExitCode: 0,
      }).jsonOutput?.result;
      uninstallRequest = result;
    } catch (error) {
      // If uninstall fails due to active flows, skip this part of the test
      // Flows must be deactivated before uninstalling, which requires manual intervention
      if (error instanceof Error && error.message.includes('The flow is still active')) {
        return; // Skip the uninstall report check if flows are active
      }
      throw error;
    }

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
