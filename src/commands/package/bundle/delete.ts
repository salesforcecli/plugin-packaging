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
import { PackageBundle, BundleSaveResult } from '@salesforce/packaging';
import { requiredHubFlag } from '../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_bundle_delete');

export class PackageBundleDeleteCommand extends SfCommand<BundleSaveResult> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    'no-prompt': Flags.boolean({
      char: 'n',
      summary: messages.getMessage('flags.no-prompt.summary'),
    }),
    bundle: Flags.string({
      char: 'b',
      summary: messages.getMessage('flags.bundle.summary'),
      required: true,
    }),
  };

  public async run(): Promise<BundleSaveResult> {
    const { flags } = await this.parse(PackageBundleDeleteCommand);
    const message = messages.getMessage('prompt-delete');
    const accepted = flags['no-prompt'] || flags.json ? true : await this.confirm({ message });
    if (!accepted) {
      throw messages.createError('prompt-delete-deny');
    }

    const connection = flags['target-dev-hub'].getConnection(flags['api-version']);
    const result = await PackageBundle.delete(connection, this.project!, flags.bundle);
    this.display(result);
    return result;
  }

  private display(result: BundleSaveResult): void {
    this.log();
    if ((result as { success: boolean }).success) {
      this.logSuccess(messages.getMessage('humanSuccess', [(result as { id: string }).id]));
    } else {
      this.error(messages.getMessage('humanError'));
    }
  }
}
