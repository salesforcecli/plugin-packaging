/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Config } from '@oclif/core';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { PackageBundle } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import sinon from 'sinon';
import { BundleListCommand } from '../../../src/commands/package/bundles/list.js';
describe('force:bundle:list - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let listStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);

    listStub = $$.SANDBOX.stub(PackageBundle, 'list');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should list a bundle', async () => {
    const cmd = new BundleListCommand(['-v', testOrg.username], config);

    listStub.resolves([{ BundleName: 'test-bundle', Id: 'test-id', Description: 'test-description' }]);

    await cmd.run();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledOnce).to.be.true;
  });

  it('should throw error when test org flag is missing', async () => {
    const cmd = new BundleListCommand([], config);

    listStub.resolves([{ BundleName: 'test-bundle', Id: 'test-id', Description: 'test-description' }]);

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include('No default dev hub found');
    }
  });
});
