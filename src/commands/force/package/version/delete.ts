/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { PackageSaveResult, PackageVersion } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_delete');

export class PackageVersionDeleteCommand extends SfdxCommand {
  public static aliases = ['force:package:beta:version:delete'];
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
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
    const packageVersion = new PackageVersion({
      connection: this.hubOrg.getConnection(),
      project: this.project,
      idOrAlias: this.flags.package as string,
    });
    await this.confirmDelete();
    const results = this.flags.undelete ? await packageVersion.undelete() : await packageVersion.delete();
    this.ux.log(this.getHumanSuccessMessage(results));
    return results;
  }

  private async confirmDelete(): Promise<boolean> {
    if (this.flags.noprompt || this.flags.json) {
      return true;
    }
    const message = this.flags.undelete ? messages.getMessage('promptUndelete') : messages.getMessage('promptDelete');
    const accepted = await this.ux.confirm(message);
    if (!accepted) {
      throw new Error(messages.getMessage('promptDeleteDeny'));
    }
  }

  private getHumanSuccessMessage(result: PackageSaveResult): string {
    return messages.getMessage(this.flags.undelete ? 'humanSuccessUndelete' : 'humanSuccess', [result.id]);
  }
}
