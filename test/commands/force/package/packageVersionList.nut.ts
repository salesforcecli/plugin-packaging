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

describe('package:version:list', () => {
  let session: TestSession;
  let usernameOrAlias: string;
  before(async () => {
    const executablePath = path.join(process.cwd(), 'bin', 'dev');
    session = await TestSession.create({
      setupCommands: [`${executablePath} config:get ${OrgConfigProperties.TARGET_DEV_HUB} --json`],
      project: { name: 'packageVersionList' },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    usernameOrAlias = (session.setup[0] as { result: [{ value: string }] }).result[0].value;

    if (!usernameOrAlias) throw Error('no default username set');
  });

  after(async () => {
    await session?.clean();
  });
  it('should list package versions in dev hub - human readable results', () => {
    const command = `force:package:beta:version:list -v ${usernameOrAlias}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout as string;
    expect(output).to.contain('=== Package Versions [');
    expect(output).to.match(
      /Package Name\s+Namespace\s+Version Name\s+Version\s+Subscriber Package Version Id\sAlias\s+Installation Key\s+Released\s+Validation Skipped\s+Ancestor\s+Ancestor Version\s+Branch/
    );
  });

  it('should list package versions in dev hub - concise output', () => {
    const command = `force:package:beta:version:list -v ${usernameOrAlias} --concise`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout as string;
    expect(output).to.contain('=== Package Versions [');
    expect(output).to.match(/Package Id\s+Version\s+Subscriber Package Version Id\s+Released/);
  });

  it('should list package versions modified in the last 5 days', () => {
    const command = `force:package:beta:version:list -v ${usernameOrAlias} --modifiedlastdays 5`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout as string;
    expect(output).to.contain('=== Package Versions [');
    expect(output).to.match(
      /Package Name\s+Namespace\s+Version Name\s+Version\s+Subscriber Package Version Id\sAlias\s+Installation Key\s+Released\s+Validation Skipped\s+Ancestor\s+Ancestor Version\s+Branch/
    );
  });
  it('should list package versions created in the last 5 days', () => {
    const command = `force:package:beta:version:list -v ${usernameOrAlias} --createdlastdays 5`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout as string;
    expect(output).to.contain('=== Package Versions [');
    expect(output).to.match(
      /Package Name\s+Namespace\s+Version Name\s+Version\s+Subscriber Package Version Id\sAlias\s+Installation Key\s+Released\s+Validation Skipped\s+Ancestor\s+Ancestor Version\s+Branch/
    );
  });
  it('should list installed packages in dev hub - verbose human readable results', () => {
    const command = `force:package:beta:version:list -v ${usernameOrAlias} --verbose`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout as string;
    expect(output).to.contain('=== Package Versions [');
    expect(output).to.match(
      /Package Name\s+Namespace\s+Version Name\s+Version\s+Subscriber Package Version Id\sAlias\s+Installation Key\s+Released\s+Validation Skipped\s+Ancestor\s+Ancestor Version\s+Branch\s+Package Id\s+Installation URL\s+Package Version Id\s+Created Date\s+Last Modified Date\s+Tag\s+Description\s+Code Coverage\s+Code Coverage Met\s+Converted From Version Id\s+Org-Dependent\s+Unlocked Package\s+Release\s+Version\s+Build Duration in Seconds\s+Managed Metadata Removed\s+Created By/
    );
  });
  it('should list package versions in dev hub - json results', () => {
    const command = `force:package:beta:version:list -v ${usernameOrAlias} --json`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const output = execCmd(command, { ensureExitCode: 0 }).jsonOutput as {
      status: number;
      result: { [key: string]: unknown };
    };
    const keys = [
      'Package2Id',
      'Branch',
      'Tag',
      'MajorVersion',
      'MinorVersion',
      'PatchVersion',
      'BuildNumber',
      'Id',
      'SubscriberPackageVersionId',
      'Name',
      'NamespacePrefix',
      'Package2Name',
      'Description',
      'Version',
      'IsPasswordProtected',
      'IsReleased',
      'CreatedDate',
      'LastModifiedDate',
      'InstallUrl',
      'CodeCoverage',
      'ValidationSkipped',
      'AncestorId',
      'AncestorVersion',
      'Alias',
      'IsOrgDependent',
      'ReleaseVersion',
      'BuildDurationInSeconds',
      'HasMetadataRemoved',
      'CreatedBy',
    ];
    expect(output).to.be.ok;
    expect(output.status).to.equal(0);
    expect(output.result).to.have.length.greaterThan(0);
    expect(output.result[0]).to.have.keys(keys);
  });
});
