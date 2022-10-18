/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';

describe('package list', () => {
  let session: TestSession;
  before(async () => {
    session = await TestSession.create({
      devhubAuthStrategy: 'AUTO',
      project: { name: 'packageList' },
    });
    await fs.promises.mkdir(session.dir, { recursive: true });
  });

  after(async () => {
    await session?.clean();
  });
  it('should list packages in dev hub - human readable results', function () {
    const command = `force:package:beta:list -v ${session.hubOrg.username}`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output).to.contain('=== Packages');
    expect(output).to.match(/Namespace Prefix\s+?Name\s+?Id\s+?Alias\s+?Description\s+?Type/);
  });
  it('should list packages in dev hub - verbose human readable results', function () {
    const command = `force:package:beta:list -v ${session.hubOrg.username} --verbose`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output).to.contain('=== Packages');
    expect(output).to.match(
      /Namespace Prefix\s+?Name\s+?Id\s+?Alias\s+?Description\s+?Type\s+?Subscriber Package Id\s+?Converted From Package Id\s+?Org-Dependent Unlocked Package\s+?Error Notification Username\s+?Created By/
    );
  });
  it('should list packages in dev hub - json results', function () {
    const command = `force:package:beta:list -v ${session.hubOrg.username} --json`;
    const output = execCmd<{ [key: string]: unknown }>(command, { ensureExitCode: 0 }).jsonOutput;
    const keys = [
      'Id',
      'SubscriberPackageId',
      'Name',
      'Description',
      'NamespacePrefix',
      'ContainerOptions',
      'ConvertedFromPackageId',
      'PackageErrorUsername',
      'Alias',
      'CreatedBy',
      'IsOrgDependent',
    ];
    expect(output).to.be.ok;
    expect(output.status).to.equal(0);
    expect(output.result).to.have.length.greaterThan(0);
    expect(output.result[0]).to.have.keys(keys);
  });
});
