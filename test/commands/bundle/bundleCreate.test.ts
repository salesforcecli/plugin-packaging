/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Config } from '@oclif/core';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { BundleCreateOptions, PackageBundle } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { Connection, SfProject } from '@salesforce/core';
import { PackageBundlesCreate } from '../../../src/commands/package/bundle/create.js';

describe('force:bundle:create - tests', () => {
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
