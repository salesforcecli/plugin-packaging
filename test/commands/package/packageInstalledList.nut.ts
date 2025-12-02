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
import { PackageInstalledListResult } from '../../../src/commands/package/installed/list.js';

describe('package:installed:list', () => {
  let session: TestSession;

  // TODO: na40 required as DevHub
  before(async () => {
    session = await TestSession.create({
      devhubAuthStrategy: 'AUTO',
    });
  });

  after(async () => {
    await session?.clean();
  });
  it('should list all installed packages in dev hub - human readable results', () => {
    const command = `package:installed:list  -o ${session.hubOrg.username}`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output).to.match(
      /ID\s+?|Package ID\s+?|Package Name\s+?|Namespace\s+?|Package Version ID\s+?|Version Name\s+?|Version/
    );
  });

  it('should list all installed packages in dev hub - json', () => {
    const command = `package:installed:list  -o ${session.hubOrg.username} --json`;
    const output = execCmd<PackageInstalledListResult[]>(command, { ensureExitCode: 0 }).jsonOutput?.result[0];
    expect(output).to.have.keys(
      'Id',
      'SubscriberPackageId',
      'SubscriberPackageName',
      'SubscriberPackageNamespace',
      'VersionSettings',
      'SubscriberPackageVersionId',
      'SubscriberPackageVersionName',
      'SubscriberPackageVersionNumber'
    );
    expect(output?.Id).to.be.a('string');
    expect(output?.SubscriberPackageId).to.be.a('string');
    expect(output?.SubscriberPackageName).to.be.a('string');
    expect(output?.SubscriberPackageNamespace).to.be.a('string');
    expect(output?.VersionSettings).to.be.a('string');
    expect(output?.SubscriberPackageVersionId).to.be.a('string');
    expect(output?.SubscriberPackageVersionName).to.be.a('string');
    expect(output?.SubscriberPackageVersionNumber).to.be.a('string');
  });
});
