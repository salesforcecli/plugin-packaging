/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { Package, PackageCreateOptions, PackageType } from '@salesforce/packaging';
import { requiredHubFlag } from '../../utils/hubFlag';

Messages.importMessagesDirectory(__dirname);
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
      this.project,
      options
    );
    this.display(result);
    return result;
  }

  private display(result: PackageCreate): void {
    this.styledHeader('Ids');
    this.table([{ name: 'Package Id', value: result.Id }], { name: { header: 'NAME' }, value: { header: 'VALUE' } });
  }
}
