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
import { Package, PackageCreateOptions, PackageType } from '@salesforce/packaging';
import { requiredHubFlag } from '../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_create');

export type PackageCreate = { Id: string };
export class PackageCreateCommand extends SfCommand<PackageCreate> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:create'];
  public static readonly requiresProject = true;
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    name: Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.name.summary'),
      required: true,
    }),
    'package-type': Flags.custom<PackageType>({
      options: ['Managed', 'Unlocked'],
    })({
      required: true,
      char: 't',
      deprecateAliases: true,
      aliases: ['packagetype'],
      summary: messages.getMessage('flags.package-type.summary'),
      description: messages.getMessage('flags.package-type.description'),
    }),
    description: Flags.string({
      char: 'd',
      summary: messages.getMessage('flags.description.summary'),
    }),
    'no-namespace': Flags.boolean({
      char: 'e',
      deprecateAliases: true,
      aliases: ['nonamespace'],
      summary: messages.getMessage('flags.no-namespace.summary'),
      description: messages.getMessage('flags.no-namespace.description'),
    }),
    path: Flags.directory({
      char: 'r',
      summary: messages.getMessage('flags.path.summary'),
      required: true,
    }),
    'org-dependent': Flags.boolean({
      deprecateAliases: true,
      aliases: ['orgdependent'],
      summary: messages.getMessage('flags.org-dependent.summary'),
      description: messages.getMessage('flags.org-dependent.description'),
    }),
    'error-notification-username': Flags.string({
      // eslint-disable-next-line sf-plugin/dash-o
      char: 'o',
      deprecateAliases: true,
      aliases: ['errornotificationusername'],
      summary: messages.getMessage('flags.error-notification-username.summary'),
      description: messages.getMessage('flags.error-notification-username.description'),
    }),
  };

  public async run(): Promise<PackageCreate> {
    const { flags } = await this.parse(PackageCreateCommand);
    const options: PackageCreateOptions = {
      description: flags.description ?? '',
      errorNotificationUsername: flags['error-notification-username'] as string,
      name: flags.name,
      noNamespace: flags['no-namespace'],
      orgDependent: flags['org-dependent'],
      packageType: flags['package-type'],
      path: flags.path,
    };
    const result: PackageCreate = await Package.create(
      flags['target-dev-hub'].getConnection(flags['api-version']),
      this.project!,
      options
    );
    this.display(result);
    return result;
  }

  private display(result: PackageCreate): void {
    this.table({ data: [{ name: 'Package Id', value: result.Id }], title: 'Ids' });
  }
}
