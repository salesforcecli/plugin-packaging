/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { OrgConfigProperties } from '@salesforce/core';
import { expect } from 'chai';
import { Package1Display } from '@salesforce/packaging';

let session: TestSession;
let usernameOrAlias: string;
let packageId: string;

// TODO: na40 required as DevHub
before(async () => {
  const executablePath = path.join(process.cwd(), 'bin', 'dev');
  session = await TestSession.create({
    setupCommands: [`${executablePath} config:get ${OrgConfigProperties.TARGET_DEV_HUB} --json`],
    project: { name: 'package1VersionList' },
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  usernameOrAlias = (session.setup[0] as { result: [{ value: string }] }).result[0].value;

  if (!usernameOrAlias) throw Error('no default username set');
});

after(async () => {
  await session?.clean();
});

describe('package1:version:list', () => {
  it('should list all 1gp packages in dev hub - human readable results', () => {
    const command = `force:package1:beta:version:list  -u ${usernameOrAlias}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout as string;
    expect(output).to.match(
      /MetadataPackageVersionId\s+?MetadataPackageId\s+?Name\s+?Version\s+?ReleaseState\s+?BuildNumber/
    );
  });

  it('should list 1gp packages in dev hub - json', () => {
    const command = `force:package1:beta:version:list -u ${usernameOrAlias} --json`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd<Package1Display[]>(command, { ensureExitCode: 0 }).jsonOutput.result[0];
    expect(output).to.have.keys(
      'MetadataPackageVersionId',
      'MetadataPackageId',
      'Name',
      'Version',
      'ReleaseState',
      'BuildNumber'
    );
    expect(output.BuildNumber).to.be.a('number');
    expect(output.ReleaseState).to.be.a('string');
    expect(output.MetadataPackageVersionId).to.be.a('string');
    expect(output.MetadataPackageId).to.be.a('string');
    expect(output.Version).to.be.a('string');
  });

  before(() => {
    const command = `force:package1:beta:version:list -u ${usernameOrAlias} --json`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    packageId = execCmd<Package1Display[]>(command, { ensureExitCode: 0 }).jsonOutput.result[0].MetadataPackageId;
  });

  it('should list all 1gp related to the package id - human readable results', () => {
    const command = `force:package1:beta:version:list -i ${packageId}  -u ${usernameOrAlias}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout as string;
    expect(output).to.match(
      /MetadataPackageVersionId\s+?MetadataPackageId\s+?Name\s+?Version\s+?ReleaseState\s+?BuildNumber/
    );
  });

  it('should list 1gp packages in dev hub related to the package id - human readable results - no results', () => {
    // fake package ID
    const command = `force:package1:beta:version:list -i 03346000000MrC0AXX -u ${usernameOrAlias}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout as string;
    expect(output.trim()).to.contain('No Results Found');
  });

  it("should validate packageversionid flag (doesn't start with 033)", () => {
    // fake package ID - not an 033 package
    const command = `force:package1:beta:version:list -i 03446000001ZfaAAAS -u ${usernameOrAlias}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 1 }).shellOutput.stderr as string;
    expect(output).to.contain('Verify that you entered a valid package version ID (starts with 033) and try again.');
  });

  it('should validate packageversionid flag (too short)', () => {
    // fake package ID - not an 033 package
    const command = `force:package1:beta:version:list -i 03346000001Zfa -u ${usernameOrAlias}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 1 }).shellOutput.stderr as string;
    expect(output).to.contain('Verify that you entered a valid package version ID (starts with 033) and try again.');
  });

  it('should list 1gp packages in dev hub related to the package id - json', () => {
    const command = `force:package1:beta:version:list -i ${packageId} -u ${usernameOrAlias} --json`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd<Package1Display[]>(command, { ensureExitCode: 0 }).jsonOutput.result[0];
    expect(output).to.have.keys(
      'MetadataPackageVersionId',
      'MetadataPackageId',
      'Name',
      'Version',
      'ReleaseState',
      'BuildNumber'
    );
    expect(output.BuildNumber).to.be.a('number');
    expect(output.ReleaseState).to.be.a('string');
    expect(output.MetadataPackageVersionId).to.be.a('string');
    expect(output.MetadataPackageId).to.be.a('string');
    expect(output.Version).to.be.a('string');
  });
});
