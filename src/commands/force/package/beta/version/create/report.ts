/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxPropertyKeys } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create_report');

export class PackageVersionCreateReportCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly longDescription = messages.getMessage('cliLongDescription');
  public static readonly help = messages.getMessage('help');
  public static readonly;
  public static readonly orgType = SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME;
  public static readonly requiresDevhubUsername = true;
  public static readonly flagsConfig: FlagsConfig = {
    packagecreaterequestid: flags.id({
      char: 'i',
      description: messages.getMessage('requestId'),
      longDescription: messages.getMessage('requestIdLong'),
      required: true,
    }),
  };

  public async run(): Promise<unknown> {
    process.exitCode = 1;
    return Promise.resolve('Not yet implemented');
  }
}
