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
import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect } from 'chai';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { Org, SfProject } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { PackageVersionCreateRequestResult } from '@salesforce/packaging';
import { FileDownloadEntry } from '../../../src/commands/package/version/retrieve.js';

let packageName: string;
let devHubOrg: Org;

describe('package:version:create with managed package (--generate-pkg-zip)', () => {
  let session: TestSession;
  let managedPackageId: string;

  before('setup managed package', async function () {
    // TODO: Remove once 260 is released to instance the CI dev hub is running on
    this.skip();
    this.timeout(Duration.minutes(5).milliseconds);

    session = await TestSession.create({
      devhubAuthStrategy: 'AUTO',
      project: { name: 'managed-pkg-test' },
    });

    devHubOrg = await Org.create({ aliasOrUsername: session.hubOrg.username });

    // Query for existing managed package
    const existingPkgQuery = `
      SELECT Id, Name, NamespacePrefix
      FROM Package2
      WHERE ContainerOptions = 'Managed'
      AND IsDeprecated = false
      AND Name = 'pnhmanaged'
      LIMIT 1
    `;
    const existingPkgRecords = (
      await devHubOrg
        .getConnection()
        .tooling.query<{ Id: string; Name: string; NamespacePrefix: string }>(existingPkgQuery)
    ).records;

    managedPackageId = existingPkgRecords[0].Id;

    // Create minimal source structure for a custom object
    const objectName = 'TestObject__c';
    const objectDir = path.join(session.project.dir, 'force-app', 'main', 'default', 'objects', objectName);
    fs.mkdirSync(objectDir, { recursive: true });

    fs.writeFileSync(
      path.join(objectDir, `${objectName}.object-meta.xml`),
      `<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <deploymentStatus>Deployed</deploymentStatus>
    <label>Test Object</label>
    <nameField>
        <label>Test Object Name</label>
        <type>Text</type>
    </nameField>
    <pluralLabel>Test Objects</pluralLabel>
    <sharingModel>ReadWrite</sharingModel>
</CustomObject>`
    );

    // Configure the project for the managed package
    const project = await SfProject.resolve(session.project.dir);
    const projectJson = project.getSfProjectJson();
    const namespacePrefix = existingPkgRecords[0].NamespacePrefix;
    packageName = existingPkgRecords[0].Name;

    const packageDirectory = {
      path: 'force-app',
      package: existingPkgRecords[0].Name,
      versionNumber: '1.0.0.NEXT',
      ancestorVersion: 'NONE',
      versionName: 'v1',
      default: true,
    };

    projectJson.set('packageDirectories', [packageDirectory]);
    projectJson.set('packageAliases', { [packageName]: managedPackageId });
    projectJson.set('namespace', namespacePrefix);
    projectJson.writeSync();
  });

  after(async () => {
    await session?.clean();
  });

  it('should create a managed package version with --generate-pkg-zip flag and retrieve the metadata', async function () {
    this.timeout(Duration.minutes(25).milliseconds);

    const createResult = execCmd<PackageVersionCreateRequestResult>(
      `package:version:create --package ${packageName} --wait 20 -x --generate-pkg-zip --version-description "Test pkg zip" --json --skip-ancestor-check`,
      { ensureExitCode: 0, timeout: Duration.minutes(20).milliseconds }
    ).jsonOutput?.result;

    // Debug: verify the flag was actually set
    const pvcRequestId = createResult?.Id;
    const verifyQuery = `SELECT Id, IsDevUsePkgZipRequested FROM Package2VersionCreateRequest WHERE Id = '${pvcRequestId}'`;
    const verifyResult = await devHubOrg
      .getConnection()
      .tooling.query<{ Id: string; IsDevUsePkgZipRequested: boolean }>(verifyQuery);
    // eslint-disable-next-line no-console
    console.log('IsDevUsePkgZipRequested:', verifyResult.records[0]?.IsDevUsePkgZipRequested);

    expect(createResult?.Status).to.equal('Success');
    const subscriberPkgVersionId = createResult?.SubscriberPackageVersionId;
    expect(subscriberPkgVersionId).to.match(/04t.{15}/);

    const retrieveOutputDir = 'pkg-zip-test-output';
    const retrieveResult = execCmd<FileDownloadEntry[]>(
      `package:version:retrieve --package ${subscriberPkgVersionId} --output-dir ${retrieveOutputDir} --json`,
      { ensureExitCode: 0 }
    ).jsonOutput?.result;

    expect(retrieveResult).to.be.an('array');
    expect(retrieveResult?.length).to.be.greaterThan(0);
  });
});
