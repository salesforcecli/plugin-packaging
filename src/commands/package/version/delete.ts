/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core/messages';
import { PackageSaveResult, PackageVersion } from '@salesforce/packaging';
import { requiredHubFlag } from '../../../utils/hubFlag.js';
import { maybeGetProject } from '../../../utils/getProject.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_delete');

export class PackageVersionDeleteCommand extends SfCommand<PackageSaveResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:version:delete'];
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    'no-prompt': Flags.boolean({
      char: 'n',
      deprecateAliases: true,
      aliases: ['noprompt'],
      summary: messages.getMessage('flags.no-prompt.summary'),
    }),
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.package.summary'),
      required: true,
    }),
    undelete: Flags.boolean({
      summary: messages.getMessage('flags.undelete.summary'),
      hidden: true,
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const { flags } = await this.parse(PackageVersionDeleteCommand);
    const packageVersion = new PackageVersion({
      connection: flags['target-dev-hub'].getConnection(flags['api-version']),
      project: await maybeGetProject(),
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
    const accepted = await this.confirm({ message });
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
