/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredHubFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { Package, PackageCreateOptions, PackageType } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_create');

export class PackageCreateCommand extends SfCommand<{ Id: string }> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('summary');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);

  public static readonly requiresProject = true;
  public static readonly flags = {
    loglevel,
    'target-hub-org': requiredHubFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    name: Flags.string({
      char: 'n',
      summary: messages.getMessage('name'),
      description: messages.getMessage('name-long'),
      required: true,
    }),
    'package-type': Flags.enum({
      char: 't',
      aliases: ['packagetype'],
      summary: messages.getMessage('package-type'),
      description: messages.getMessage('package-type-long'),
      required: true,
      options: ['Managed', 'Unlocked'],
    }),
    description: Flags.string({
      char: 'd',
      summary: messages.getMessage('description'),
      description: messages.getMessage('description-long'),
    }),
    'no-namespace': Flags.boolean({
      char: 'e',
      aliases: ['nonamespace'],
      summary: messages.getMessage('no-namespace'),
      description: messages.getMessage('no-namespace-long'),
    }),
    path: Flags.directory({
      char: 'r',
      summary: messages.getMessage('path'),
      description: messages.getMessage('path-long'),
      required: true,
    }),
    'org-dependent': Flags.boolean({
      aliases: ['orgdependent'],
      summary: messages.getMessage('org-dependent'),
      description: messages.getMessage('org-dependent-long'),
    }),
    'error-notification-username': Flags.string({
      char: 'o',
      aliases: ['errornotificationusername'],
      summary: messages.getMessage('error-notification-username'),
      description: messages.getMessage('error-notification-username-long'),
    }),
  };

  public async run(): Promise<{ Id: string }> {
    const { flags } = await this.parse(PackageCreateCommand);
    const options: PackageCreateOptions = {
      description: flags.description ?? '',
      errorNotificationUsername: flags['error-notification-username'] as string,
      name: flags.name,
      noNamespace: flags['no-namespace'],
      orgDependent: flags['org-dependent'],
      packageType: flags['package-type'] as PackageType,
      path: flags.path,
    };
    const result: { Id: string } = await Package.create(
      flags['target-hub-org'].getConnection(flags['api-version']),
      this.project,
      options
    );
    this.display(result);
    return result;
  }

  private display(result: { Id: string }): void {
    this.styledHeader('Ids');
    this.table([{ name: 'Package Id', value: result.Id }], { name: { header: 'NAME' }, value: { header: 'VALUE' } });
  }
}
