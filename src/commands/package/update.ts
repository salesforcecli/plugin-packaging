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
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_update');
const packageCreate = Messages.loadMessages('@salesforce/plugin-packaging', 'package_create');

export class PackageUpdateCommand extends SfCommand<PackageSaveResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:update'];
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.package.summary'),
      required: true,
    }),
    name: Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.name.summary'),
    }),
    description: Flags.string({
      char: 'd',
      summary: messages.getMessage('flags.description.summary'),
    }),
    'error-notification-username': Flags.string({
      // eslint-disable-next-line sf-plugin/dash-o
      char: 'o',
      deprecateAliases: true,
      aliases: ['errornotificationusername'],
      summary: packageCreate.getMessage('flags.error-notification-username.summary'),
      description: packageCreate.getMessage('flags.error-notification-username.description'),
    }),
    'enable-app-analytics': Flags.boolean({
      summary: messages.getMessage('flags.enable-app-analytics.summary'),
      allowNo: true,
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const { flags } = await this.parse(PackageUpdateCommand);

    const pkg = new Package({
      packageAliasOrId: flags.package,
      connection: flags['target-dev-hub'].getConnection(flags['api-version']),
      project: await maybeGetProject(),
    });

    const result = await pkg.update({
      Id: pkg.getId(),
      Name: flags.name,
      Description: flags.description,
      PackageErrorUsername: flags['error-notification-username'],
      AppAnalyticsEnabled: flags['enable-app-analytics'],
    });

    this.logSuccess(messages.getMessage('success', [pkg.getId()]));

    return result;
  }
}
