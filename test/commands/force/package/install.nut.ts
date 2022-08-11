/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { PackagingSObjects } from '@salesforce/packaging';
type PackageInstallRequest = PackagingSObjects.PackageInstallRequest;

describe('package install', () => {
  let session: TestSession;
  before(async () => {
    session = await TestSession.create({
      setupCommands: ['sfdx force:org:create -d 1 -s -f config/project-scratch-def.json'],
      project: { name: 'packageInstall' },
    });
  });

  after(async () => {
    await session?.clean();
  });

  it('should install ElectronBranding package with polling', function () {
    const command = 'force:package:beta:install -p 04t6A000002zgKSQAY -w 10';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout as string;
    expect(output).to.contain('Successfully installed package');
  });

  it('should install DFXP Escape Room package (async) and report', function () {
    const installCommand = 'force:package:beta:install -p 04t6A000002zgKSQAY --json';
    const installJson = execCmd<PackageInstallRequest>(installCommand, { ensureExitCode: 0 }).jsonOutput.result;
    expect(installJson).to.have.property('Status', 'IN_PROGRESS');

    const reportCommand = `force:package:beta:install:report -i ${installJson.Id} --json`;
    const reportJson = execCmd<PackageInstallRequest>(reportCommand, { ensureExitCode: 0 }).jsonOutput.result;
    expect(reportJson).to.have.property('Status', 'IN_PROGRESS');
  });
});
