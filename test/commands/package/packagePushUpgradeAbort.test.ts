// /*
//  * Copyright (c) 2024, salesforce.com, inc.
//  * All rights reserved.
//  * Licensed under the BSD 3-Clause license.
//  * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
//  */
// import fs from 'node:fs';
// import { expect } from 'chai';
// import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
// import { Config } from '@oclif/core';
// import { PackagePushUpgrade, PackagePushUpgradeAbortResult } from '@salesforce/packaging';
// import { PackagePushUpgradeAbortCommand } from '../../../src/commands/package/pushupgrade/abort.js';

// describe('package:pushupgrade:abort - tests', () => {
//   const $$ = new TestContext();
//   const testOrg = new MockTestOrgData();
//   const createStub = $$.SANDBOX.stub(PackagePushUpgrade, 'schedule');
//   const config = new Config({ root: import.meta.url });

//   const stubSpinner = (cmd: PackagePushUpgradeAbortCommand) => {
//     $$.SANDBOX.stub(cmd.spinner, 'start');
//     $$.SANDBOX.stub(cmd.spinner, 'stop');
//   };

//   before(async () => {
//     await $$.stubAuths(testOrg);
//     await config.load();

//     // Create actual file
//     fs.writeFileSync('valid-orgs.csv', '00D00000000000100D000000000002');
//   });

//   afterEach(() => {
//     // Clean up file
//     $$.restore();
//   });

//   it('should successfully schedule a push upgrade', async () => {
//     const mockResult: PackagePushScheduleResult = {
//       PushRequestId: 'mockPushJobId',
//       ScheduledStartTime: '2023-01-01T00:00:00Z',
//       Status: 'Scheduled',
//     };

//     createStub.resolves(mockResult);

//     // Mock the file system
//     const mockOrgIds = ['00D000000000001', '00D000000000002'];
//     const mockFileContent = mockOrgIds.join('');
//     $$.SANDBOX.stub(fs, 'readFileSync').returns(mockFileContent);
//     $$.SANDBOX.stub(fs, 'existsSync').returns(true);

//     const cmd = new PackagePushScheduleCommand(
//       [
//         '-i',
//         '04tXXXXXXXXXXXXXXX',
//         '-v',
//         'test@hub.org',
//         '--scheduled-start-time',
//         '2023-01-01T00:00:00Z',
//         '--org-list',
//         'valid-orgs.csv',
//       ],
//       config
//     );

//     stubSpinner(cmd);

//     try {
//       const res = await cmd.run();
//       expect(res).to.eql(mockResult);
//       expect(createStub.calledOnce).to.be.true;
//     } catch (error) {
//       expect.fail(`Test should not throw an error: ${(error as Error).message}`);
//     }
//     // Clean up file
//     fs.unlinkSync('valid-orgs.csv');
//   });

//   it('should fail to schedule push upgrade', async () => {
//     const errorMessage = 'Failed to schedule push upgrade';
//     createStub.rejects(new Error(errorMessage));

//     const cmd = new PackagePushScheduleCommand(
//       [
//         '-i',
//         '04tXXXXXXXXXXXXXXX',
//         '-v',
//         'test@hub.org',
//         '--scheduled-start-time',
//         '2023-01-01T00:00:00Z',
//         '--org-list',
//         'valid-orgs.csv',
//       ],
//       config
//     );

//     stubSpinner(cmd);

//     try {
//       await cmd.run();
//       // If the command runs successfully, fail the test
//       expect.fail('Expected an error to be thrown');
//     } catch (error) {
//       expect(error).to.be.instanceOf(Error);
//     }
//   });
// });