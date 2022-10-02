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

describe('package list', () => {
  let session: TestSession;
  let usernameOrAlias: string;
  before(async () => {
    const executablePath = path.join(process.cwd(), 'bin', 'dev');
    session = await TestSession.create({
      setupCommands: [`${executablePath} config:get ${OrgConfigProperties.TARGET_DEV_HUB} --json`],
      project: { name: 'packageList' },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    usernameOrAlias = (session.setup[0] as { result: [{ value: string }] }).result[0].value;

    if (!usernameOrAlias) throw Error('no default username set');
  });

  after(async () => {
    await session?.clean();
  });
  it('should list packages in dev hub - human readable results', () => {
    const command = `force:package:beta:list -v ${usernameOrAlias}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output).to.contain('=== Packages');
    expect(output).to.match(/Namespace Prefix\s+?Name\s+?Id\s+?Alias\s+?Description\s+?Type/);
  });
  it('should list packages in dev hub - verbose human readable results', () => {
    const command = `force:package:beta:list -v ${usernameOrAlias} --verbose`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output).to.contain('=== Packages');
    expect(output).to.match(
      /Namespace Prefix\s+?Name\s+?Id\s+?Alias\s+?Description\s+?Type\s+?Subscriber Package Id\s+?Converted From Package Id\s+?Org-Dependent Unlocked Package\s+?Error Notification Username\s+?Created By/
    );
  });
  it('should list packages in dev hub - json results', () => {
    const command = `force:package:beta:list -v ${usernameOrAlias} --json`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 0 }).jsonOutput as {
      status: number;
      result: { [key: string]: unknown };
    };
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
