/*
 * Copyright 2025, Salesforce, Inc.
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
import { Config } from '@oclif/core';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { PackageBundleVersion } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import sinon from 'sinon';
import { PackageBundleVersionListCommand } from '../../../src/commands/package/bundle/version/list.js';
describe('package:bundle:version:list - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let listStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);

    listStub = $$.SANDBOX.stub(PackageBundleVersion, 'list');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should list a bundle', async () => {
    const cmd = new PackageBundleVersionListCommand(['-v', testOrg.username], config);

    listStub.resolves([
      {
        Id: 'test-version-id',
        PackageBundle: {
          Id: 'test-bundle-id',
          BundleName: 'test-bundle',
          Description: undefined,
          IsDeleted: false,
          CreatedDate: '2025-01-01T00:00:00.000Z',
          CreatedById: 'test-user-id',
          LastModifiedDate: '2025-01-01T00:00:00.000Z',
          LastModifiedById: 'test-user-id',
          SystemModstamp: '2025-01-01T00:00:00.000Z',
        },
        VersionName: 'test-version',
        MajorVersion: '1',
        MinorVersion: '0',
        CreatedDate: '2025-01-01T00:00:00.000Z',
        CreatedById: 'test-user-id',
        LastModifiedDate: '2025-01-01T00:00:00.000Z',
        LastModifiedById: 'test-user-id',
        Ancestor: null,
        IsReleased: false,
      },
    ]);

    await cmd.run();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledOnce).to.be.true;
  });

  it('should throw error when test org flag is missing', async () => {
    const cmd = new PackageBundleVersionListCommand([], config);

    listStub.resolves([
      {
        Id: 'test-version-id',
        PackageBundle: {
          Id: 'test-bundle-id',
          BundleName: 'test-bundle',
          Description: undefined,
          IsDeleted: false,
          CreatedDate: '2025-01-01T00:00:00.000Z',
          CreatedById: 'test-user-id',
          LastModifiedDate: '2025-01-01T00:00:00.000Z',
          LastModifiedById: 'test-user-id',
          SystemModstamp: '2025-01-01T00:00:00.000Z',
        },
        VersionName: 'test-version',
        MajorVersion: '1',
        MinorVersion: '0',
        CreatedDate: '2025-01-01T00:00:00.000Z',
        CreatedById: 'test-user-id',
        LastModifiedDate: '2025-01-01T00:00:00.000Z',
        LastModifiedById: 'test-user-id',
        Ancestor: null,
        IsReleased: false,
      },
    ]);

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include('No default dev hub found');
    }
  });
});
