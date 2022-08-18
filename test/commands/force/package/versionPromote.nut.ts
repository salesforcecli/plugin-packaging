/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, genUniqueString, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { getPackageIdFromAlias } from '@salesforce/packaging';
import { SfProject } from '@salesforce/core';
import { PackageVersionPromoteResponse } from '../../../../src/commands/force/package/beta/version/promote';
// TODO: enable once `package:beta:version:create` is released
describe.skip('package:version:promote', () => {
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
    // TODO: requires this command
    execCmd(
      `force:package:beta:version:create --package ${pkgName} --version 1.0.0 --codecoverage --description "Initial version"`,
      { ensureExitCode: 0 }
    );
    packageId = getPackageIdFromAlias(pkgName, SfProject.getInstance());
  });

  after(async () => {
    await session?.clean();
  });

  it('should promote a package (human readable)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const result = execCmd(`force:package:beta:version:promote --package ${pkgName} --noprompt`, { ensureExitCode: 0 })
      .shellOutput.stdout as string;
    expect(result).to.contain(
      `Successfully promoted the package version, ID: ${packageId}, to released. Starting in Winter ‘21, only unlocked package versions that have met the minimum 75% code coverage requirement can be promoted. Code coverage minimums aren’t enforced on org-dependent unlocked packages.`
    );
  });

  it('should promote a package (--json)', () => {
    const result = execCmd<PackageVersionPromoteResponse>(
      `force:package:beta:version:promote --package ${pkgName} --noprompt --json`,
      {
        ensureExitCode: 0,
      }
    ).jsonOutput.result;
    expect(result).to.have.all.keys('id', 'success', 'errors');
    expect(result.id).to.equal(packageId);
    expect(result.success).to.equal(true);
    expect(result.errors).to.equal([]);
  });
});
