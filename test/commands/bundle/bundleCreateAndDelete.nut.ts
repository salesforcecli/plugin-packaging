/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
