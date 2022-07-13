/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxPropertyKeys } from '@salesforce/core';
import {
  applyErrorAction,
  createPackage,
  massageErrorMessage,
  PackageCreateOptions,
  PackageType,
} from '@salesforce/packaging';

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
    }),
    nonamespace: flags.boolean({
      char: 'e',
      description: messages.getMessage('noNamespace'),
      longDescription: messages.getMessage('noNamespaceLong'),
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
    }),
    errornotificationusername: flags.string({
      char: 'o',
      description: messages.getMessage('errorNotificationUsername'),
      longDescription: messages.getMessage('errorNotificationUsernameLong'),
    }),
  };

  public async run(): Promise<{ Id: string }> {
    const options: PackageCreateOptions = {
      description: (this.flags.description || '') as string,
      errorNotificationUsername: this.flags.errornotificationusername as string,
      name: this.flags.name as string,
      noNamespace: this.flags.nonamespace as boolean,
      orgDependent: this.flags.orgdependent as boolean,
      packageType: this.flags.packagetype as PackageType,
      path: this.flags.path as string,
    };
    const result: { Id: string } = await createPackage(this.hubOrg.getConnection(), this.project, options).catch(
      (err) => {
        // TODO: until package2 is GA, wrap perm-based errors w/ 'contact sfdc' action (REMOVE once package2 is GA'd)
        err = massageErrorMessage(err);
        throw applyErrorAction(err);
      }
    );
    if (!this.flags.json) {
      this.display(result);
    }
    return result;
  }

  private display(result: { Id: string }): void {
    this.ux.styledHeader('Ids');
    this.ux.table([{ name: 'Package Id', value: result.Id }], { name: { header: 'NAME' }, value: { header: 'VALUE' } });
  }
}
