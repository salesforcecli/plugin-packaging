/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredHubFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { PackageSaveResult, PackageVersion } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_delete');

export class PackageVersionDeleteCommand extends SfCommand<PackageSaveResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly aliases = ['force:package:beta:version:delete', 'force:package:version:delete'];
  public static readonly requiresProject = true;
  public static readonly flags = {
    loglevel,
    'target-hub-org': requiredHubFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    'no-prompt': Flags.boolean({
      char: 'n',
      aliases: ['noprompt'],
      summary: messages.getMessage('no-prompt'),
      description: messages.getMessage('no-prompt'),
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
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const { flags } = await this.parse(PackageVersionDeleteCommand);
    const packageVersion = new PackageVersion({
      connection: flags['target-hub-org'].getConnection(flags['api-version']),
      project: this.project,
      idOrAlias: flags.package,
    });
    await this.confirmDelete(flags['no-prompt'], flags.undelete);
    const results = flags.undelete ? await packageVersion.undelete() : await packageVersion.delete();
    this.logSuccess(this.getHumanSuccessMessage(results, flags.undelete));
    return results;
  }

  private async confirmDelete(noprompt: boolean, undelete: boolean): Promise<boolean> {
    if (noprompt || this.jsonEnabled()) {
      return true;
    }
    const message = undelete ? messages.getMessage('prompt-undelete') : messages.getMessage('prompt-delete');
    const accepted = await this.confirm(message);
    if (!accepted) {
      throw new Error(messages.getMessage('prompt-delete-deny'));
    }
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  private getHumanSuccessMessage(result: PackageSaveResult, undelete: boolean): string {
    return messages.getMessage(undelete ? 'humanSuccessUndelete' : 'humanSuccess', [result.id]);
  }
}
