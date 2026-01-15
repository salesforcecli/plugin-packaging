/*
 * Copyright 2026, Salesforce, Inc.
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
import { Messages, SfError } from '@salesforce/core';
import { PackageSaveResult, PackageVersion } from '@salesforce/packaging';
import { requiredHubFlag } from '../../../utils/hubFlag.js';
import { maybeGetProject } from '../../../utils/getProject.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_promote');

export class PackageVersionPromoteCommand extends SfCommand<PackageSaveResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:version:promote'];
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.package.summary'),
      required: true,
    }),
    'no-prompt': Flags.boolean({
      char: 'n',
      deprecateAliases: true,
      aliases: ['noprompt'],
      summary: messages.getMessage('flags.no-prompt.summary'),
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const { flags } = await this.parse(PackageVersionPromoteCommand);
    const packageVersion = new PackageVersion({
      connection: flags['target-dev-hub'].getConnection(flags['api-version']),
      project: await maybeGetProject(),
      idOrAlias: flags.package,
    });
    const packageVersionData = await packageVersion.getData();

    if (!flags.json && !flags['no-prompt']) {
      // Warn when a Managed package has removed metadata
      if (packageVersionData.HasMetadataRemoved) {
        this.warn(messages.getMessage('hasMetadataRemovedWarning'));
      }

      // Prompt for confirmation
      if (!(await this.confirm({ message: messages.getMessage('packageVersionPromoteConfirm', [flags.package]) }))) {
        throw messages.createError('promote-deny');
      }
    }

    try {
      const result = await packageVersion.promote();
      result.id = packageVersionData.SubscriberPackageVersionId;
      this.log(messages.getMessage('humanSuccess', [result.id]));
      return result;
    } catch (e) {
      const err = SfError.wrap(e as Error);
      if (err.name === 'DUPLICATE_VALUE' && err.message.includes('previously released')) {
        err.message = messages.getMessage('previouslyReleasedMessage');
        err.actions = [messages.getMessage('previouslyReleasedAction', [this.config.bin, this.config.bin])];
      }
      throw err;
    }
  }
}
