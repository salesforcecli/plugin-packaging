/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxPropertyKeys } from '@salesforce/core';
import { applyErrorAction, deletePackage, massageErrorMessage, PackageSaveResult } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_delete');

export class PackageDeleteCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly longDescription = messages.getMessage('cliLongDescription');
  public static readonly help = messages.getMessage('help');
  public static readonly orgType = SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME;
  public static readonly requiresDevhubUsername = true;
  public static readonly requiresProject = true;
  public static readonly flagsConfig: FlagsConfig = {
    noprompt: flags.boolean({
      char: 'n',
      description: messages.getMessage('noPrompt'),
      longDescription: messages.getMessage('noPrompt'),
    }),
    package: flags.string({
      char: 'p',
      description: messages.getMessage('package'),
      longDescription: messages.getMessage('packageLong'),
      required: true,
    }),
    undelete: flags.boolean({
      description: messages.getMessage('undelete'),
      longDescription: messages.getMessage('undeleteLong'),

      hidden: true,
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    // user must acknowledge the warning prompt or use noprompt flag
    const accepted = await this.prompt(
      this.flags.noprompt || this.flags.json,
      messages.getMessage(this.flags.undelete ? 'promptUndelete' : 'promptDelete')
    );
    if (!accepted) {
      throw messages.createError('promptDeleteDeny');
    }

    const result = await deletePackage(
      this.flags.package,
      this.project,
      this.hubOrg.getConnection(),
      !!this.flags.undelete
    ).catch((err) => {
      // TODO: until package2 is GA, wrap perm-based errors w/ 'contact sfdc' action (REMOVE once package2 is GA'd)
      err = massageErrorMessage(err);
      throw applyErrorAction(err);
    });
    this.display(result);
    return result;
  }

  private async prompt(noninteractive, message): Promise<boolean> {
    const answer = noninteractive ? true : await this.ux.confirm(message);
    // print a line of white space after the prompt is entered for separation
    this.ux.log('');
    return answer;
  }

  private display(result: PackageSaveResult): void {
    const message = messages.getMessage(this.flags.undelete ? 'humanSuccessUndelete' : 'humanSuccess', [result.id]);
    this.ux.log();
    this.ux.log(message);
  }
}
