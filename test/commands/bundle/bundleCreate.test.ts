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
import * as sinon from 'sinon';
import { expect } from 'chai';
import { BundleCreateOptions, PackageBundle } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { Connection, SfProject } from '@salesforce/core';
import { PackageBundlesCreate } from '../../../src/commands/package/bundle/create.js';

describe('package:bundle:create - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let createStub: sinon.SinonStub<[Connection, SfProject, BundleCreateOptions], Promise<{ Id: string }>>;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);

    createStub = $$.SANDBOX.stub(PackageBundle, 'create');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should create a bundle', async () => {
    const bundleName = 'dummyPackageId';
    const cmd = new PackageBundlesCreate(['-v', testOrg.username, '--name', bundleName], config);

    createStub.resolves({ Id: 'test-id' });

    await cmd.run();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledOnce).to.be.true;
  });

  it('should throw error when name flag is missing', async () => {
    const cmd = new PackageBundlesCreate(['-v', testOrg.username], config);

    createStub.resolves({ Id: 'test-id' });

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include('Missing required flag name');
    }
  });

  it('should throw error when test org flag is missing', async () => {
    const cmd = new PackageBundlesCreate(['--name', 'dummyPackageId'], config);

    createStub.resolves({ Id: 'test-id' });

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include('No default dev hub found');
    }
  });
});
