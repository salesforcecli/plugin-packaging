/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { join, resolve } from 'node:path';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { SourceComponent, registry } from '@salesforce/source-deploy-retrieve';
import { Package, PackageVersionMetadataDownloadResult } from '@salesforce/packaging';
import { PackageVersionRetrieveCommand } from '../../../src/commands/package/version/retrieve';

const myPackageVersion04t = '04t000000000001';

const pkgVersionRetrieveSuccessResult: PackageVersionMetadataDownloadResult = {
  packagePath: '/tmp/foo',
  converted: [
    new SourceComponent({
      name: 'ComponentA',
      type: registry.types['apexclass'],
      xml: join('nonexistentDir', 'ComponentA.cls-meta.xml'),
      content: join('nonexistentDir', 'ComponentA.cls'),
    }),
    new SourceComponent({
      name: 'ComponentB',
      type: registry.types['customobject'],
      content: join('nonexistentDir', 'ComponentB.object-meta.xml'),
    }),
  ],
};

const expectedRetrievedComponents = [
  {
    filePath: join('nonexistentDir', 'ComponentA.cls-meta.xml'),
    fullName: 'ComponentA',
    type: 'ApexClass',
  },
  {
    filePath: join('nonexistentDir', 'ComponentA.cls'),
    fullName: 'ComponentA',
    type: 'ApexClass',
  },
  {
    filePath: join('nonexistentDir', 'ComponentB.object-meta.xml'),
    fullName: 'ComponentB',
    type: 'CustomObject',
  },
];

describe('package:version:retrieve - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const downloadStub = $$.SANDBOX.stub(Package, 'downloadPackageVersionMetadata');
  const config = new Config({ root: resolve(__dirname, '../../package.json') });

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  afterEach(() => {
    $$.restore();
  });

  describe('package:version:retrieve', () => {
    it('should display retrieved files', async () => {
      downloadStub.resolves(pkgVersionRetrieveSuccessResult);
      const cmd = new PackageVersionRetrieveCommand(['-p', myPackageVersion04t, '-o', 'test@dev.org'], config);
      const res = await cmd.run();
      expect(res).to.deep.equal(expectedRetrievedComponents);
    });
  });
});
