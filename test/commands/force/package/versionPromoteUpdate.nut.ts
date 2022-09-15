/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, genUniqueString, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { PackageSaveResult } from '@salesforce/packaging';
import { Duration } from '@salesforce/kit';

describe('package:version:promote / package:version:update', () => {
  let packageId: string;
  const pkgName = genUniqueString('dancingbears-');
  let session: TestSession;

  before(async () => {
    session = await TestSession.create({
      setupCommands: ['sfdx force:org:create -d 1 -s -f config/project-scratch-def.json'],
      project: { gitClone: 'https://github.com/trailheadapps/dreamhouse-lwc' },
    });

    const id = execCmd<{ Id: string }>(
      `force:package:beta:create --name ${pkgName} --loglevel debug --packagetype Unlocked --path force-app --description "Don't ease, don't ease, don't ease me in." --json`,
      { ensureExitCode: 0 }
    ).jsonOutput.result.Id;

    packageId = execCmd<{ SubscriberPackageVersionId: string }>(
      `force:package:beta:version:create --package ${id} --loglevel debug -w 20 -x --json --codecoverage --versiondescription "Initial version"`,
      { ensureExitCode: 0, timeout: Duration.minutes(20).milliseconds }
    ).jsonOutput.result.SubscriberPackageVersionId;
  });

  after(async () => {
    await session.zip('dreamhouse-lwc4', '/Users/peter.hale');
    await session?.clean();
  });

  it('should promote a package (human readable)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const result = execCmd(`force:package:beta:version:promote --package ${packageId} --noprompt`, {
      ensureExitCode: 0,
    }).shellOutput.stdout;
    expect(result).to.contain('Successfully promoted the package version');
    expect(result).to.contain('04t');
    expect(result).to.contain(
      'to released. Starting in Winter ‘21, only unlocked package versions that have met the minimum 75% code coverage requirement can be promoted. Code coverage minimums aren’t enforced on org-dependent unlocked packages.'
    );
  });

  it('should promote a package (--json)', () => {
    const result = execCmd<PackageSaveResult>(
      `force:package:beta:version:promote --package ${packageId} --noprompt --json`,
      {
        ensureExitCode: 0,
      }
    ).jsonOutput.result;
    expect(result).to.have.all.keys('id', 'success', 'errors');
    expect(result.id.startsWith('04t')).to.be.true;
    expect(result.success).to.equal(true);
    expect(result.errors).to.deep.equal([]);
  });

  it('should update a package (human readable)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const result = execCmd(`force:package:beta:version:update --package ${packageId} --branch MySuperCoolBranch`, {
      ensureExitCode: 0,
    }).shellOutput.stdout;
    expect(result).to.contain(`Successfully updated the package version. ${packageId}`);
  });

  it('should update a package (--json)', () => {
    const result = execCmd<PackageSaveResult>(
      `force:package:beta:version:update --package ${packageId} --branch MySuperCoolBranch2 --json`,
      {
        ensureExitCode: 0,
      }
    ).jsonOutput.result;
    expect(result).to.have.all.keys('id', 'success', 'errors');
    expect(result.id).to.equal(packageId);
    expect(result.success).to.equal(true);
    expect(result.errors).to.deep.equal([]);
  });
});
