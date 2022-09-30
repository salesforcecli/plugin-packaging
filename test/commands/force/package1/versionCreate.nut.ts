/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import * as fs from 'fs';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { PackagingSObjects } from '@salesforce/packaging';
import { sleep } from '@salesforce/kit';

type PackageUploadRequest = PackagingSObjects.PackageUploadRequest;

const pollUntilComplete = async (id: string): Promise<PackageUploadRequest> => {
  const result = execCmd<PackageUploadRequest>(`force:package1:beta:version:create:get -i ${id} -u 1gp --json`, {
    ensureExitCode: 0,
  }).jsonOutput.result;
  if (result.Status === 'SUCCESS') {
    return result;
  } else {
    await sleep(5000);
    await pollUntilComplete(id);
  }
};

describe('package1:version:create', () => {
  let session: TestSession;
  let packageId: string;
  let uploadRequestId: string; // 0Hd

  before(async () => {
    if (!process.env.ONEGP_TESTKIT_AUTH_URL) {
      throw new Error('"ONEGP_TESTKIT_AUTH_URL" env var required for 1gp NUTs');
    }
    const authPath = path.join(process.cwd(), 'authUrl.txt');
    await fs.promises.writeFile(authPath, process.env.ONEGP_TESTKIT_AUTH_URL, 'utf8');
    const executablePath = path.join(process.cwd(), 'bin', 'dev');
    session = await TestSession.create({
      setupCommands: [`${executablePath} auth:sfdxurl:store -f ${authPath} -a 1gp`],
      project: { name: 'package1VersionDisplay' },
    });
    packageId = execCmd<[{ MetadataPackageId: string }]>('force:package1:beta:version:list --json -u 1gp', {
      ensureExitCode: 0,
    }).jsonOutput.result[0].MetadataPackageId;
  });

  after(async () => {
    if (fs.existsSync('authUrl.txt')) await fs.promises.rm('authUrl.txt');
    await session?.clean();
  });
  // we need to the run the synchronous command first, to avoid duplicate package version create API requests in the NUTs
  it(`should create a new 1gp package version for package id ${packageId} and wait`, () => {
    const command = `force:package1:beta:version:create -n 1gpPackageNUT -i ${packageId} -w 5 -u 1gp`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output.trim()).to.match(/Successfully uploaded package \[04t.{15}]/);
  });

  it(`should create a new 1gp package version for package id ${packageId} and wait (json)`, () => {
    const command = `force:package1:beta:version:create -n 1gpPackageNUT -i ${packageId} --json -w 5 -u 1gp`;
    const output = execCmd<PackageUploadRequest>(command, { ensureExitCode: 0 }).jsonOutput.result;
    expect(output.Status).to.equal('SUCCESS');
    expect(output.Id).to.be.a('string');
    expect(output.MetadataPackageId).to.be.a('string');
    expect(output.MetadataPackageVersionId).to.be.a('string');
    expect(output.MetadataPackageVersionId.startsWith('04t')).to.be.true;
    expect(output.MetadataPackageId.startsWith('033')).to.be.true;
  });

  it(`should create a new 1gp package version for package id ${packageId} without waiting`, async () => {
    const command = `force:package1:beta:version:create -n 1gpPackageNUT -i ${packageId} -u 1gp`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output).to.match(/PackageUploadRequest has been enqueued\./);
    // sfdx force:package1:beta:version:create:get -i 0HD4p000000blVAGAY -u admin@integrationtestrelorgna40.org
    expect(output).to.match(/sfdx force:package1:beta:version:create:get -i 0HD.{15} -u/);
    // ensure the package has uploaded by waiting for the package report to be done
    uploadRequestId = /0HD\w*/.exec(output)[0];
    await pollUntilComplete(uploadRequestId);
  });

  it(`should create a new 1gp package version for package id ${packageId} (json)`, async () => {
    const command = `force:package1:beta:version:create -n 1gpPackageNUT -i ${packageId} --json -u 1gp`;
    const output = execCmd<PackageUploadRequest>(command, { ensureExitCode: 0 }).jsonOutput.result;
    expect(output.Status).to.equal('QUEUED');
    expect(output.Id).to.be.a('string');
    expect(output.MetadataPackageId).to.be.a('string');
    expect(output.MetadataPackageVersionId).to.be.a('string');
    expect(output.MetadataPackageVersionId.startsWith('04t')).to.be.true;
    expect(output.MetadataPackageId.startsWith('033')).to.be.true;
    // ensure the package has uploaded by waiting for the package report to be done
    await pollUntilComplete(output.Id);
  });

  describe('package1:version:create:get', () => {
    it('will get the result (human)', () => {
      const command = `force:package1:beta:version:create:get -i ${uploadRequestId} -u 1gp`;
      const result = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
      expect(result).to.match(/Successfully uploaded package \[04t.{15}]/);
    });

    it('will get the result (json)', () => {
      const command = `force:package1:beta:version:create:get -i ${uploadRequestId} -u 1gp --json`;
      const result = execCmd<PackageUploadRequest>(command, { ensureExitCode: 0 }).jsonOutput.result;
      expect(result).to.have.all.keys(
        'Id',
        'attributes',
        'IsDeleted',
        'CreatedDate',
        'CreatedById',
        'LastModifiedDate',
        'LastModifiedById',
        'SystemModstamp',
        'MetadataPackageId',
        'MetadataPackageVersionId',
        'IsReleaseVersion',
        'VersionName',
        'Description',
        'MajorVersion',
        'MinorVersion',
        'ReleaseNotesUrl',
        'PostInstallUrl',
        'Password',
        'Status',
        'Errors'
      );
      expect(result.Id).to.match(/0HD.{15}/);
      expect(result.MetadataPackageId).to.match(/033.{15}/);
      expect(result.MetadataPackageVersionId).to.match(/04t.{15}/);
    });
  });
});
