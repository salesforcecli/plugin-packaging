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
import { join } from 'node:path';
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { SourceComponent, registry } from '@salesforce/source-deploy-retrieve';
import { Package, PackageVersionMetadataDownloadResult } from '@salesforce/packaging';
import { PackageVersionRetrieveCommand } from '../../../src/commands/package/version/retrieve.js';

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
  const config = new Config({ root: import.meta.url });

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
      const cmd = new PackageVersionRetrieveCommand(['-p', myPackageVersion04t, '-v', 'test@dev.org'], config);
      const res = await cmd.run();
      expect(res).to.deep.equal(expectedRetrievedComponents);
    });
  });
});
