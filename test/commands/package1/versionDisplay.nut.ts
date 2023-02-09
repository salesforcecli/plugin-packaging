/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { Package1Display } from '@salesforce/packaging';

describe('package1:version:display', () => {
  let session: TestSession;
  // TODO: na40 required as DevHub
  // hardcoded for now, eventually will be able to query from the org with package1:version:list
  const packageVersionId = '04t46000001ZfaAAAS';
  before(async () => {
    session = await TestSession.create({
      devhubAuthStrategy: 'AUTO',
      project: { name: 'package1VersionDisplay' },
    });
  });

  after(async () => {
    await session?.clean();
  });

  it('should list 1gp packages in dev hub - human readable results', () => {
    const command = `package1:version:display -i ${packageVersionId} -o ${session.hubOrg.username}`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output).to.match(
      /MetadataPackageVersionId\s+?MetadataPackageId\s+?Name\s+?Version\s+?ReleaseState\s+?BuildNumber/
    );
  });

  it('should list 1gp packages in dev hub - human readable results - no results', () => {
    // fake package ID
    const command = `package1:version:display -i 04t46000001ZfaXXXX -o ${session.hubOrg.username}`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output).to.contain('No results found');
  });

  it('should validate packageversionid flag (too short)', () => {
    // fake package ID - too short
    const command = `package1:version:display -i 04t46000001Zfa -o ${session.hubOrg.username}`;
    const output = execCmd(command, { ensureExitCode: 1 }).shellOutput.stderr;
    expect(output).to.contain('The id must be 15 or 18 characters.');
  });

  it("should validate packageversionid flag (doesn't start with 04t)", () => {
    // fake package ID - not an 04t package
    const command = `package1:version:display -i 05t46000001ZfaAAAS -o ${session.hubOrg.username}`;
    const output = execCmd(command, { ensureExitCode: 1 }).shellOutput.stderr;
    expect(output).to.contain('The id must begin with 04t');
  });

  it('should list 1gp packages in dev hub - json', () => {
    const command = `package1:version:display -i ${packageVersionId} -o ${session.hubOrg.username} --json`;
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
