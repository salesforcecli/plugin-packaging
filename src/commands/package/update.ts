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
import { Package, PackageSaveResult } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_update');
const packageCreate = Messages.loadMessages('@salesforce/plugin-packaging', 'package_create');

export class PackageUpdateCommand extends SfCommand<PackageSaveResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly aliases = ['force:package:beta:update', 'force:package:update'];
  public static readonly requiresProject = true;
  public static readonly flags = {
    loglevel,
    'target-hub-org': requiredHubFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('package'),
      description: messages.getMessage('package-long'),
      required: true,
    }),
    name: Flags.string({
      char: 'n',
      summary: messages.getMessage('name'),
      description: messages.getMessage('name-long'),
    }),
    description: Flags.string({
      char: 'd',
      summary: messages.getMessage('description'),
      description: messages.getMessage('description-long'),
    }),
    'error-notification-username': Flags.string({
      // eslint-disable-next-line sf-plugin/dash-o
      char: 'o',
      aliases: ['errornotificationusername'],
      summary: packageCreate.getMessage('error-notification-username'),
      description: packageCreate.getMessage('error-notification-username-long'),
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const { flags } = await this.parse(PackageUpdateCommand);
    const pkg = new Package({
      packageAliasOrId: flags.package,
      connection: flags['target-hub-org'].getConnection(flags['api-version']),
      project: this.project,
    });

    const result = await pkg.update({
      Id: pkg.getId(),
      Name: flags.name,
      Description: flags.description,
      PackageErrorUsername: flags['error-notification-username'],
    });

    this.logSuccess(messages.getMessage('success', [pkg.getId()]));

    return result;
  }
}
