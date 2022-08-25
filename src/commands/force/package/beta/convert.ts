/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Duration } from '@salesforce/kit';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_convert');

export class PackageConvert extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresDevhubUsername = true;
  public static readonly hidden = true;
  public static readonly flagsConfig: FlagsConfig = {
    package: flags.id({
      char: 'p',
      description: messages.getMessage('package'),
      longDescription: messages.getMessage('longPackage'),
      required: true,
      validate: /^033/,
    }),
    installationkey: flags.string({
      char: 'k',
      description: messages.getMessage('key'),
      longDescription: messages.getMessage('longKey'),
      exactlyOne: ['installationkey', 'installationkeybypass'],
    }),
    installationkeybypass: flags.boolean({
      char: 'x',
      description: messages.getMessage('keyBypass'),
      longDescription: messages.getMessage('longKeyBypass'),
      exactlyOne: ['installationkey', 'installationkeybypass'],
    }),
    wait: flags.minutes({
      char: 'w',
      description: messages.getMessage('wait'),
      longDescription: messages.getMessage('longWait'),
      default: Duration.minutes(0),
    }),
    buildinstance: flags.string({
      char: 's',
      description: messages.getMessage('instance'),
      longDescription: messages.getMessage('longInstance'),
      hidden: true,
    }),
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  public async run(): Promise<unknown> {
    throw new Error('Beta command not yet implemented');
  }
}
