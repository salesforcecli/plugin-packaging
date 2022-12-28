/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredHubFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { Package, PackageSaveResult } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_delete');

export class PackageDeleteCommand extends SfCommand<PackageSaveResult> {
  public static readonly summary = messages.getMessage('cliDescription');
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);

  public static readonly requiresProject = true;
  public static readonly flags = {
    loglevel,
    'target-hub-org': requiredHubFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    'no-prompt': Flags.boolean({
      char: 'n',
      aliases: ['noprompt'],
      summary: messages.getMessage('no-prompt'),
      description: messages.getMessage('no-prompt-long'),
    }),
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('package'),
      description: messages.getMessage('package-long'),
      required: true,
    }),
    undelete: Flags.boolean({
      summary: messages.getMessage('undelete'),
      description: messages.getMessage('undelete-long'),
      hidden: true,
      default: false,
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const { flags } = await this.parse(PackageDeleteCommand);
    const promptMsg = flags.undelete ? 'promptUndelete' : 'promptDelete';
    const accepted = flags['no-prompt'] || flags.json ? true : await this.confirm(messages.getMessage(promptMsg));
    if (!accepted) {
      throw messages.createError('promptDeleteDeny');
    }

    const pkg = new Package({
      connection: flags['target-hub-org'].getConnection(flags['api-version']),
      project: this.project,
      packageAliasOrId: flags.package,
    });
    const result = flags.undelete ? await pkg.undelete() : await pkg.delete();
    this.display(result, flags.undelete);
    return result;
  }

  private display(result: PackageSaveResult, undelete: boolean): void {
    const message = messages.getMessage(undelete ? 'humanSuccessUndelete' : 'humanSuccess', [result.id]);
    this.log();
    this.log(message);
  }
}
