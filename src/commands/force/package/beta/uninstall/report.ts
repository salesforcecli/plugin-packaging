/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_uninstall_report');

export class PackageUninstallReportCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresUsername = true;
  public static readonly flagsConfig: FlagsConfig = {
    requestid: flags.id({
      char: 'i',
      description: messages.getMessage('requestId'),
      longDescription: messages.getMessage('requestIdLong'),
      required: true,
    }),
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  public async run(): Promise<unknown> {
    throw new Error('Beta command not yet implemented');
  }
}
