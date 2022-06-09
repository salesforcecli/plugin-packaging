/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxPropertyKeys } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_create');
const packageVersionCreate = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create');

export class PackageCreateCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly longDescription = messages.getMessage('cliLongDescription');
  public static readonly help = messages.getMessage('help');
  public static readonly orgType = SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME;
  public static readonly requiresDevhubUsername = true;
  public static readonly requiresProject = true;
  public static readonly flagsConfig: FlagsConfig = {
    name: flags.string({
      char: 'n',
      description: messages.getMessage('name'),
      longDescription: messages.getMessage('nameLong'),
      required: true,
    }),
    packagetype: flags.enum({
      char: 't',
      description: messages.getMessage('packageType'),
      longDescription: messages.getMessage('packageTypeLong'),
      required: true,
      options: ['Managed', 'Unlocked'],
    }),
    description: flags.string({
      char: 'd',
      description: messages.getMessage('description'),
      longDescription: messages.getMessage('descriptionLong'),
      required: false,
    }),
    nonamespace: flags.boolean({
      char: 'e',
      description: messages.getMessage('noNamespace'),
      longDescription: messages.getMessage('noNamespaceLong'),
      required: false,
    }),
    path: flags.directory({
      char: 'r',
      description: packageVersionCreate.getMessage('path'),
      longDescription: packageVersionCreate.getMessage('longPath'),
      required: true,
    }),
    orgdependent: flags.boolean({
      description: messages.getMessage('orgDependent'),
      longDescription: messages.getMessage('orgDependentLong'),
      required: false,
    }),
    errornotificationusername: flags.string({
      char: 'o',
      description: messages.getMessage('errorNotificationUsername'),
      longDescription: messages.getMessage('errorNotificationUsernameLong'),
      required: false,
    }),
  };

  public async run(): Promise<unknown> {
    process.exitCode = 1;
    return Promise.resolve('Not yet implemented');
  }
}
