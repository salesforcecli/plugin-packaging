/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// import * as os from 'os';
import { resolve } from 'path';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { SourceComponent, registry } from '@salesforce/source-deploy-retrieve';
import { Package, PackageVersionMetadataDownloadResult } from '@salesforce/packaging';
import { PackageVersionRetrieveCommand } from '../../../src/commands/package/version/retrieve';

const pkgVersionSourcesDownloadSuccessResult: PackageVersionMetadataDownloadResult = {
  packagePath: '/tmp/foo',
  converted: [
    new SourceComponent({
      name: 'ComponentA',
      type: registry.types['customobject'],
      xml: '/path/does/not/exist/ComponentA.object-meta.xml',
    }),
    new SourceComponent({
      name: 'ComponentB',
      type: registry.types['customobject'],
      content: '/path/does/not/exist/ComponentB.object-meta.xml',
    }),
  ],
};

describe('package:version:create - tests', () => {
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

  describe('package:version:sources:download', () => {
    it('should display downloaded sources in tabular format', async () => {
      downloadStub.resolves(pkgVersionSourcesDownloadSuccessResult);
      const cmd = new PackageVersionRetrieveCommand(['-p', '04t000000000001', '-o', 'test@dev.org'], config);
      const res = await cmd.run();
      expect(res).to.deep.equal([
        {
          filePath: '../../../../../path/does/not/exist/ComponentA.object-meta.xml',
          fullName: 'ComponentA',
          type: 'CustomObject',
        },
        {
          filePath: '../../../../../path/does/not/exist/ComponentB.object-meta.xml',
          fullName: 'ComponentB',
          type: 'CustomObject',
        },
      ]);
    });
  });
});
