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

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_update');

export class PackageVersionUpdateCommand extends SfCommand<PackageSaveResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:version:update'];
  public static readonly requiresProject = true;
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.package.summary'),
      required: true,
    }),
    'version-name': Flags.string({
      aliases: ['versionname'],
      deprecateAliases: true,
      char: 'a',
      summary: messages.getMessage('flags.version-name.summary'),
    }),
    'version-description': Flags.string({
      aliases: ['versiondescription'],
      deprecateAliases: true,
      char: 'e',
      summary: messages.getMessage('flags.version-description.summary'),
    }),
    branch: Flags.string({
      char: 'b',
      summary: messages.getMessage('flags.branch.summary'),
    }),
    tag: Flags.string({
      char: 't',
      summary: messages.getMessage('flags.tag.summary'),
    }),
    'installation-key': Flags.string({
      aliases: ['installationkey'],
      deprecateAliases: true,
      char: 'k',
      summary: messages.getMessage('flags.installation-key.summary'),
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const { flags } = await this.parse(PackageVersionUpdateCommand);
    const pv = new PackageVersion({
      connection: flags['target-dev-hub'].getConnection(flags['api-version']),
      project: this.project!,
      idOrAlias: flags.package,
    });
    const result = await pv.update({
      VersionDescription: flags['version-description'],
      Branch: flags.branch,
      InstallKey: flags['installation-key'],
      VersionName: flags['version-name'],
      Tag: flags.tag,
    });

    this.logSuccess(messages.getMessage('success', [result.id]));

    return result;
  }
}
