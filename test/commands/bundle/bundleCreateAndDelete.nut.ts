/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';

describe('bundle create/delete', () => {
  let session: TestSession;
  let bundleName: string;
  before(async () => {
    session = await TestSession.create({
      devhubAuthStrategy: 'AUTO',
      project: { name: 'bundleCreateDelete' },
    });
  });

  after(async () => {
    await session?.clean();
  });
  describe('create/delete - human results', () => {
    before(async () => {
      bundleName = `test-bundle-${Date.now()}`;
    });
    it('should create a bundle - human readable results', () => {
      const command = `package:bundle:create --name ${bundleName} -v ${session.hubOrg.username}`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('Ids');
      expect(output).to.match(/Bundle Id\s+?|1Fl/);
    });
    it('should delete a bundle - human readable results', () => {
      const command = `package:bundle:delete -b ${bundleName} -v ${session.hubOrg.username} --no-prompt`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('Successfully deleted the package bundle');
    });
  });
  describe('create/delete - json results', () => {
    before(async () => {
      bundleName = `test-bundle-${Date.now()}`;
    });
    it('should create a bundle - json results', () => {
      const command = `package:bundle:create --name ${bundleName} -v ${session.hubOrg.username} --json`;
      const output = execCmd<{ Id: string }>(command, { ensureExitCode: 0 }).jsonOutput;
      expect(output?.status).to.equal(0);
      expect(output?.result).to.have.property('Id');
      expect(output?.result?.Id).to.match(/1Fl.{12,15}/);
    });
    it('should delete a bundle - json results', () => {
      const command = `package:bundle:delete -b ${bundleName} -v ${session.hubOrg.username} --json`;
      const output = execCmd<{ id: string; success: boolean; errors: [] }>(command, { ensureExitCode: 0 }).jsonOutput;
      expect(output?.result?.id).to.match(/1Fl.{12,15}/);
      expect(output?.result?.success).to.be.true;
    });
  });
});
