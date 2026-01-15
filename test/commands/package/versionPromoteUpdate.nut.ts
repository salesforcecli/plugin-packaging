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

import path from 'node:path';
import { execCmd, genUniqueString, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { PackageSaveResult, PackageVersionCreateRequestResult } from '@salesforce/packaging';
import { Duration } from '@salesforce/kit';
import { Messages } from '@salesforce/core/messages';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_update');

describe('package:version:promote / package:version:update', () => {
  let packageId: string | undefined | null;
  const pkgName = genUniqueString('dancingbears-');
  let session: TestSession;

  before(async () => {
    session = await TestSession.create({
      devhubAuthStrategy: 'AUTO',
      scratchOrgs: [
        {
          setDefault: true,
          config: path.join('config', 'project-scratch-def.json'),
        },
      ],
      project: { gitClone: 'https://github.com/trailheadapps/dreamhouse-lwc' },
    });

    const id = execCmd<{ Id: string }>(
      `package:create --name ${pkgName} --loglevel debug --package-type Unlocked --path force-app --description "Don't ease, don't ease, don't ease me in." --json`,
      { ensureExitCode: 0 }
    ).jsonOutput?.result?.Id;

    const result = execCmd<PackageVersionCreateRequestResult>(
      `package:version:create --package ${id} --json --wait 20 --tag tag --branch branch -x --code-coverage --version-description "Initial version" --version-number 1.0.0.NEXT`,
      { ensureExitCode: 0, timeout: Duration.minutes(20).milliseconds }
    ).jsonOutput?.result;
    expect(result).to.have.all.keys(
      'Id',
      'Status',
      'Package2Id',
      'Package2Name',
      'Package2VersionId',
      'SubscriberPackageVersionId',
      'Tag',
      'Branch',
      'Error',
      'CreatedDate',
      'HasMetadataRemoved',
      'HasPassedCodeCoverageCheck',
      'CreatedBy',
      'ConvertedFromVersionId',
      'CodeCoverage',
      'VersionNumber',
      'TotalNumberOfMetadataFiles',
      'TotalSizeOfMetadataFiles'
    );
    expect(result?.Id).to.match(/08c.{15}/);
    expect(result?.Package2Id).to.match(/0Ho.{15}/);
    expect(result?.SubscriberPackageVersionId).to.match(/04t.{15}/);
    expect(result?.Package2VersionId).to.match(/05i.{15}/);
    expect(result?.Branch).to.equal('branch');
    expect(result?.Tag).to.equal('tag');
    expect(result?.Error).to.deep.equal([]);
    expect(result?.Status).to.equal('Success');
    packageId = result?.SubscriberPackageVersionId;
  });

  after(async () => {
    await session?.clean();
  });

  it('should promote a package (human readable)', () => {
    const result = execCmd(`package:version:promote --package ${packageId} --no-prompt`, {
      ensureExitCode: 0,
    }).shellOutput.stdout;
    expect(result).to.contain('Successfully promoted the package version');
    expect(result).to.contain('04t', result);
    expect(result).to.contain('to released.');
  });

  it('should promote a package (--json)', () => {
    const result = execCmd<PackageSaveResult>(`package:version:promote --package ${packageId} --no-prompt --json`, {
      ensureExitCode: 0,
    }).jsonOutput?.result;
    expect(result).to.have.all.keys('id', 'success', 'errors');
    expect(result?.id?.slice(0, 3)).to.be.equal('04t');
    expect(result?.success).to.equal(true);
    expect(result?.errors).to.deep.equal([]);
  });

  it('should update a package (human readable)', () => {
    const result = execCmd(`package:version:update --package ${packageId} --branch MySuperCoolBranch`, {
      ensureExitCode: 0,
    }).shellOutput.stdout;
    expect(result).to.contain(messages.getMessage('success', [packageId]));
  });

  it('should update a package (--json)', () => {
    const result = execCmd<PackageSaveResult>(
      `package:version:update --package ${packageId} --branch MySuperCoolBranch2 --json`,
      {
        ensureExitCode: 0,
      }
    ).jsonOutput?.result;
    expect(result).to.have.all.keys('id', 'success', 'errors');
    expect(result?.id).to.equal(packageId);
    expect(result?.success).to.equal(true);
    expect(result?.errors).to.deep.equal([]);
  });
});
