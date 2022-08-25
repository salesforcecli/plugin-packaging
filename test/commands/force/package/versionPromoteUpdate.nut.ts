/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, genUniqueString, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { PackageSaveResult } from '@salesforce/packaging';

describe('package:version:promote / package:version:update', () => {
  let session: TestSession;
  let packageId: string;
  const pkgName = genUniqueString('dancingbears-');

  before(async () => {
    session = await TestSession.create({
      setupCommands: ['sfdx force:org:create -d 1 -s -f config/project-scratch-def.json'],
      project: { gitClone: 'https://github.com/trailheadapps/dreamhouse-lwc' },
    });
    execCmd(
      `force:package:beta:create --name ${pkgName} --packagetype Unlocked --path force-app --description "Don't ease, don't ease, don't ease me in."`,
      { ensureExitCode: 0 }
    );
    packageId = execCmd<{ SubscriberPackageVersionId: string }>(
      `force:package:beta:version:create --package ${pkgName} -w 10 -x --json --codecoverage --versiondescription "Initial version"`,
      { ensureExitCode: 0 }
    ).jsonOutput.result.SubscriberPackageVersionId;
  });

  after(async () => {
    await session?.clean();
  });

  it('should promote a package (human readable)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const result = execCmd(`force:package:beta:version:promote --package ${packageId} --noprompt`, {
      ensureExitCode: 0,
    }).shellOutput.stdout as string;
    expect(result).to.contain(
      `Successfully promoted the package version, ID: ${packageId}, to released. Starting in Winter ‘21, only unlocked package versions that have met the minimum 75% code coverage requirement can be promoted. Code coverage minimums aren’t enforced on org-dependent unlocked packages.`
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
    expect(result.id).to.equal(packageId);
    expect(result.success).to.equal(true);
    expect(result.errors).to.deep.equal([]);
  });

  it('should update a package (human readable)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const result = execCmd(`force:package:beta:version:update --package ${packageId} --branch MySuperCoolBranch`, {
      ensureExitCode: 0,
    }).shellOutput.stdout as string;
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
