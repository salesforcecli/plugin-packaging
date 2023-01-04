/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { Org } from '@salesforce/core';
import { Package } from '@salesforce/packaging';

describe('package list', () => {
  let session: TestSession;
  before(async () => {
    session = await TestSession.create({
      devhubAuthStrategy: 'AUTO',
      project: { name: 'packageList' },
    });
  });

  after(async () => {
    await session?.clean();
  });
  it('should list packages in dev hub - human readable results', () => {
    const command = `force:package:list -v ${session.hubOrg.username}`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output).to.contain('=== Packages');
    expect(output).to.match(/Namespace Prefix\s+?Name\s+?Id\s+?Alias\s+?Description\s+?Type/);
  });
  it('should list packages in dev hub - verbose human readable results', () => {
    const command = `force:package:list -v ${session.hubOrg.username} --verbose`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output).to.contain('=== Packages');
    expect(output).to.match(
      /Namespace Prefix\s+?Name\s+?Id\s+?Alias\s+?Description\s+?Type\s+?Subscriber Package Id\s+?Converted From Package Id\s+?Org-Dependent Unlocked Package\s+?Error Notification Username\s+?Created By/
    );
  });
  it('should list packages in dev hub - json results', async () => {
    const hubOrg = await Org.create({ aliasOrUsername: session.hubOrg.username });
    const packages = await Package.list(hubOrg.getConnection());
    const command = `force:package:list -v ${session.hubOrg.username} --json`;
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
    const deprecatedPackages = packages.filter((pkg) => pkg.IsDeprecated);
    const notDeprecatedCount = packages.length - deprecatedPackages.length;
    expect(output).to.be.ok;
    expect(output?.status).to.equal(0);
    expect(output?.result).to.have.lengthOf(notDeprecatedCount);
    expect(output?.result[0]).to.have.keys(keys);
  });
});
