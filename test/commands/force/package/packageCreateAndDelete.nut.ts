/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';

describe('package create/update/delete', () => {
  let session: TestSession;
  let pkgName: string;

  before(async () => {
    session = await TestSession.create({
      devhubAuthStrategy: 'AUTO',
      project: { name: 'packageCreateDelete' },
    });
  });

  after(async () => {
    await session?.clean();
  });
  describe('create/update/delete - human results', () => {
    before(async () => {
      pkgName = `test-pkg-${Date.now()}`;
    });
    it('should create a package - human readable results', () => {
      const command = `force:package:create -n ${pkgName} -v ${session.hubOrg.username} -t Unlocked -r ./force-app`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('=== Ids');
      expect(output).to.match(/Package Id\s+?0Ho/);
    });
    it('should update a package - human readable results', () => {
      const command = `force:package:update --package ${pkgName} --description "My new description" -v ${session.hubOrg.username}`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.match(/Successfully updated the package\.\s+0Ho/);
    });
    it('should delete a package - human readable results', () => {
      const command = `force:package:delete -p ${pkgName} -v ${session.hubOrg.username} --noprompt`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('Successfully deleted the package. 0Ho');
    });
  });
  describe('create/update/delete - json results', () => {
    let pkgId: string;

    before(async () => {
      pkgName = `test-pkg-${Date.now()}`;
    });

    it('should create a package - json results', () => {
      const command = `force:package:create -n ${pkgName} -v ${session.hubOrg.username} -t Unlocked -r ./force-app --json`;
      const output = execCmd<{ Id: string }>(command, { ensureExitCode: 0 }).jsonOutput;
      pkgId = output.result.Id;
      expect(output.status).to.equal(0);
      expect(output.result).to.have.property('Id');
      expect(output.result.Id).to.match(/0Ho.{12,15}/);
    });

    it('should update a package - json results', () => {
      const command = `force:package:update --package ${pkgName} --description "My new description" -v ${session.hubOrg.username} --json`;
      const output = execCmd<{ id: string }>(command, { ensureExitCode: 0 }).jsonOutput;
      expect(output.status).to.equal(0);
      expect(output.result).to.have.property('id');
      expect(output.result.id).to.match(/0Ho.{12,15}/);
    });

    it('should delete a package - json results', () => {
      const command = `force:package:delete -p ${pkgId} -v ${session.hubOrg.username} --json`;
      const output = execCmd<{ id: string; success: boolean; errors: [] }>(command, { ensureExitCode: 0 }).jsonOutput;
      expect(output.result.id).to.match(/0Ho.{12,15}/);
      expect(output.result.success).to.be.true;
    });
  });
});
