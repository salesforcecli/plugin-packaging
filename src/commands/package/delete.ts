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
import { Package, PackageSaveResult } from '@salesforce/packaging';
import { requiredHubFlag } from '../../utils/hubFlag.js';
import { maybeGetProject } from '../../utils/getProject.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_delete');

export class PackageDeleteCommand extends SfCommand<PackageSaveResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:delete'];
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
      default: false,
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const { flags } = await this.parse(PackageDeleteCommand);
    const message = messages.getMessage(flags.undelete ? 'prompt-undelete' : 'prompt-delete');
    const accepted = flags['no-prompt'] || flags.json ? true : await this.confirm({ message });
    if (!accepted) {
      throw messages.createError('prompt-delete-deny');
    }

    const pkg = new Package({
      connection: flags['target-dev-hub'].getConnection(flags['api-version']),
      project: await maybeGetProject(),
      packageAliasOrId: flags.package,
    });
    const result = flags.undelete ? await pkg.undelete() : await pkg.delete();
    this.display(result, flags.undelete);
    return result;
  }

  private display(result: PackageSaveResult, undelete: boolean): void {
    this.log();
    this.logSuccess(messages.getMessage(undelete ? 'humanSuccessUndelete' : 'humanSuccess', [result.id]));
  }
}
