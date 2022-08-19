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

describe('package create and delete', () => {
  let session: TestSession;
  let devHubUsernameOrAlias: string;
  let pkgName: string;
  before(async () => {
    const executablePath = path.join(process.cwd(), 'bin', 'dev');
    session = await TestSession.create({
      setupCommands: [`${executablePath} config:get ${OrgConfigProperties.TARGET_DEV_HUB} --json`],
      project: { name: 'packageCreateDelete' },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    devHubUsernameOrAlias = (session.setup[0] as { result: [{ value: string }] }).result[0].value;

    if (!devHubUsernameOrAlias) throw Error('no default dev hub set');
  });

  after(async () => {
    await session?.clean();
  });
  describe('create/delete - human results', () => {
    before(async () => {
      pkgName = `test-pkg-${Date.now()}`;
    });
    it('should create a package - human readable results', function () {
      const command = `force:package:beta:create -n ${pkgName} -v ${devHubUsernameOrAlias} -t Unlocked -r ./force-app`;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout as string;
      expect(output).to.contain('=== Ids');
      expect(output).to.match(/Package Id\s+?0Ho/);
    });
    it('should delete a package - human readable results', function () {
      const command = `force:package:beta:delete -p ${pkgName} -v ${devHubUsernameOrAlias} --noprompt`;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout as string;
      expect(output).to.contain('Successfully deleted the package. 0Ho');
    });
  });
  describe('create/delete - json results', () => {
    before(async () => {
      pkgName = `test-pkg-${Date.now()}`;
    });
    it('should create a package - json results', function () {
      const command = `force:package:beta:create -n ${pkgName} -v ${devHubUsernameOrAlias} -t Unlocked -r ./force-app --json`;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const output = execCmd<{ Id: string }>(command, { ensureExitCode: 0 }).jsonOutput;
      expect(output.status).to.equal(0);
      expect(output.result).to.have.property('Id');
      expect(output.result.Id).to.match(/0Ho.{12,15}/);
    });
    it('should delete a package - json results', function () {
      const command = `force:package:beta:delete -p ${pkgName} -v ${devHubUsernameOrAlias} --json`;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const output = execCmd<{ id: string; success: boolean; errors: [] }>(command, { ensureExitCode: 0 }).jsonOutput;
      expect(output.result.id).to.match(/0Ho.{12,15}/);
      expect(output.result.success).to.be.true;
    });
  });
});
