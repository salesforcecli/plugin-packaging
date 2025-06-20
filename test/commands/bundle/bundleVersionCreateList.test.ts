/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Config } from '@oclif/core';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { PackageBundleVersionCreate } from '@salesforce/packaging';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import sinon from 'sinon';
import { PackageBundleVersionCreateListCommand } from '../../../src/commands/package/bundle/version/create/list.js';

describe('bundle:version:create:list - tests', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let getCreateStatusesStub: sinon.SinonStub;
  const config = new Config({ root: import.meta.url });

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);

    getCreateStatusesStub = $$.SANDBOX.stub(PackageBundleVersionCreate, 'getCreateStatuses');
  });

  afterEach(() => {
    $$.restore();
  });

  it('should list bundle version create requests', async () => {
    const cmd = new PackageBundleVersionCreateListCommand(['--target-dev-hub', testOrg.username], config);

    const mockResults = [
      {
        Id: 'test-id-1',
        RequestStatus: 'Success',
        PackageBundleId: 'bundle-id-1',
        PackageBundleVersionId: 'version-id-1',
        CreatedDate: '2023-01-01T00:00:00Z',
        CreatedById: 'user-id-1',
      },
    ];

    getCreateStatusesStub.resolves(mockResults);

    await cmd.run();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.table.calledOnce).to.be.true;
    expect(getCreateStatusesStub.calledOnce).to.be.true;
  });

  it('should show warning when no results found', async () => {
    const cmd = new PackageBundleVersionCreateListCommand(['--target-dev-hub', testOrg.username], config);

    getCreateStatusesStub.resolves([]);

    await cmd.run();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(sfCommandStubs.warn.calledOnce).to.be.true;
    expect(sfCommandStubs.warn.firstCall.args[0]).to.equal('No results found');
  });

  it('should throw error when target-dev-hub flag is missing', async () => {
    const cmd = new PackageBundleVersionCreateListCommand([], config);

    try {
      await cmd.run();
      expect.fail('Expected error was not thrown');
    } catch (error) {
      expect((error as Error).message).to.include('No default dev hub found');
    }
  });
});
