/*
 * Copyright 2025, Salesforce, Inc.
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
import { Org } from '@salesforce/core';

describe('package create/update/delete', () => {
  let session: TestSession;
  let pkgName: string;
  let hubOrg: Org;
  let apiVersion: string;
  before(async () => {
    session = await TestSession.create({
      devhubAuthStrategy: 'AUTO',
      project: { name: 'packageCreateDelete' },
    });
    hubOrg = await Org.create({ aliasOrUsername: session.hubOrg.username });
    apiVersion = hubOrg.getConnection().getApiVersion();
  });

  after(async () => {
    await session?.clean();
  });
  describe('create/update/delete - human results', () => {
    before(async () => {
      pkgName = `test-pkg-${Date.now()}`;
    });
    it('should create a package - human readable results', () => {
      const command = `package:create -n ${pkgName} -v ${session.hubOrg.username} -t Unlocked -r ./force-app`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('Ids');
      expect(output).to.match(/Package Id\s+?|0Ho/);
    });
    it('should update a package - human readable results', () => {
      const command = `package:update --package ${pkgName} --description "My new description" -v ${session.hubOrg.username}`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.match(/Successfully updated the package\.\s+0Ho/);
    });
    it('should not be able to enable app analytics on package that is not managed', () => {
      if (apiVersion >= '59.0') {
        const command = `package:update --package ${pkgName} --enable-app-analytics -v ${session.hubOrg.username}`;
        const errOut = execCmd(command, { ensureExitCode: 1 }).shellOutput.stderr;
        expect(errOut).to.contain('App Analytics is only available for managed packages');
      }
    });
    it('should delete a package - human readable results', () => {
      const command = `package:delete -p ${pkgName} -v ${session.hubOrg.username} --no-prompt`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(output).to.contain('Successfully deleted the package with ID: 0Ho');
    });
  });
  describe('create/update/delete - json results', () => {
    before(async () => {
      pkgName = `test-pkg-${Date.now()}`;
    });
    it('should create a package - json results', () => {
      const command = `package:create -n ${pkgName} -v ${session.hubOrg.username} -t Unlocked -r ./force-app --json`;
      const output = execCmd<{ Id: string }>(command, { ensureExitCode: 0 }).jsonOutput;
      expect(output?.status).to.equal(0);
      expect(output?.result).to.have.property('Id');
      expect(output?.result?.Id).to.match(/0Ho.{12,15}/);
    });
    it('should update a package - json results', () => {
      const command = `package:update --package ${pkgName} --description "My new description" -v ${session.hubOrg.username} --json`;
      const output = execCmd<{ id: string }>(command, { ensureExitCode: 0 }).jsonOutput;
      expect(output?.status).to.equal(0);
      expect(output?.result).to.have.property('id');
      expect(output?.result?.id).to.match(/0Ho.{12,15}/);
    });
    it('should delete a package - json results', () => {
      const command = `package:delete -p ${pkgName} -v ${session.hubOrg.username} --json`;
      const output = execCmd<{ id: string; success: boolean; errors: [] }>(command, { ensureExitCode: 0 }).jsonOutput;
      expect(output?.result?.id).to.match(/0Ho.{12,15}/);
      expect(output?.result?.success).to.be.true;
    });
  });
});
