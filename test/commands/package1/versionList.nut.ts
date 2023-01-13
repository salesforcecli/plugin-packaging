/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { Package1Display } from '@salesforce/packaging';

describe('package1:version:list', () => {
  let session: TestSession;
  let packageId: string | undefined;

  // TODO: na40 required as DevHub
  before(async () => {
    session = await TestSession.create({
      devhubAuthStrategy: 'AUTO',
      project: { name: 'package1VersionList' },
    });
  });

  after(async () => {
    await session?.clean();
  });

  it('should list all 1gp packages in dev hub - human readable results', () => {
    const command = `package1:version:list  -u ${session.hubOrg.username}`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output).to.match(
      /MetadataPackageVersionId\s+?MetadataPackageId\s+?Name\s+?Version\s+?ReleaseState\s+?BuildNumber/
    );
  });

  it('should list 1gp packages in dev hub - json', () => {
    const command = `package1:version:list -u ${session.hubOrg.username} --json`;
    const output = execCmd<Package1Display[]>(command, { ensureExitCode: 0 }).jsonOutput?.result[0];
    expect(output).to.have.keys(
      'MetadataPackageVersionId',
      'MetadataPackageId',
      'Name',
      'Version',
      'ReleaseState',
      'BuildNumber'
    );
    expect(output?.BuildNumber).to.be.a('number');
    expect(output?.ReleaseState).to.be.a('string');
    expect(output?.MetadataPackageVersionId).to.be.a('string');
    expect(output?.MetadataPackageId).to.be.a('string');
    expect(output?.Version).to.be.a('string');
  });

  before(() => {
    const command = `package1:version:list -u ${session.hubOrg.username} --json`;
    packageId = execCmd<Package1Display[]>(command, { ensureExitCode: 0 }).jsonOutput?.result[0].MetadataPackageId;
  });

  it('should list all 1gp related to the package id - human readable results', () => {
    const command = `package1:version:list -i ${packageId} -u ${session.hubOrg.username}`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output).to.match(
      /MetadataPackageVersionId\s+?MetadataPackageId\s+?Name\s+?Version\s+?ReleaseState\s+?BuildNumber/
    );
  });

  it('should list 1gp packages in dev hub related to the package id - human readable results - no results', () => {
    // fake package ID
    const command = `package1:version:list -i 03346000000MrC0AXX -u ${session.hubOrg.username}`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output?.trim()).to.contain('No Results Found');
  });

  it("should validate packageversionid flag (doesn't start with 033)", () => {
    // fake package ID - not an 033 package
    const command = `package1:version:list -i 03446000001ZfaAAAS -u ${session.hubOrg.username}`;
    const output = execCmd(command, { ensureExitCode: 1 }).shellOutput.stderr;
    expect(output).to.contain('The id must begin with 033.');
  });

  it('should validate packageversionid flag (too short)', () => {
    // fake package ID - not an 033 package
    const command = `package1:version:list -i 03346000001Zfa -u ${session.hubOrg.username}`;
    const output = execCmd(command, { ensureExitCode: 1 }).shellOutput.stderr;
    expect(output).to.contain('The id must be 18 characters.');
  });

  it('should list 1gp packages in dev hub related to the package id - json', () => {
    const command = `package1:version:list -i ${packageId} -u ${session.hubOrg.username} --json`;
    const output = execCmd<Package1Display[]>(command, { ensureExitCode: 0 }).jsonOutput?.result[0];
    expect(output).to.have.keys(
      'MetadataPackageVersionId',
      'MetadataPackageId',
      'Name',
      'Version',
      'ReleaseState',
      'BuildNumber'
    );
    expect(output?.BuildNumber).to.be.a('number');
    expect(output?.ReleaseState).to.be.a('string');
    expect(output?.MetadataPackageVersionId).to.be.a('string');
    expect(output?.MetadataPackageId).to.be.a('string');
    expect(output?.Version).to.be.a('string');
  });
});
