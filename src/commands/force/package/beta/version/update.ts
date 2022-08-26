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
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_update');

export class PackageVersionUpdateCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresDevhubUsername = true;
  public static readonly requiresProject = true;
  public static readonly flagsConfig: FlagsConfig = {
    package: flags.string({
      char: 'p',
      description: messages.getMessage('package'),
      longDescription: messages.getMessage('packageLong'),
      required: true,
    }),
    versionname: flags.string({
      char: 'a',
      description: messages.getMessage('name'),
      longDescription: messages.getMessage('nameLong'),
    }),
    versiondescription: flags.string({
      char: 'e',
      description: messages.getMessage('description'),
      longDescription: messages.getMessage('descriptionLong'),
    }),
    branch: flags.string({
      char: 'b',
      description: messages.getMessage('branch'),
      longDescription: messages.getMessage('branchLong'),
    }),
    tag: flags.string({
      char: 't',
      description: messages.getMessage('tag'),
      longDescription: messages.getMessage('tagLong'),
    }),
    installationkey: flags.string({
      char: 'k',
      description: messages.getMessage('key'),
      longDescription: messages.getMessage('longKey'),
    }),
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  public async run(): Promise<unknown> {
    throw new Error('Beta command not yet implemented');
  }
}
