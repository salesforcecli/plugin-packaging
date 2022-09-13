/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { BY_LABEL, getPackageIdFromAlias, Package, PackageSaveResult, validateId } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_update');
const packageCreate = Messages.loadMessages('@salesforce/plugin-packaging', 'package_create');

export class PackageUpdateCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresDevhubUsername = true;
  public static readonly requiresProject = true;
  public static readonly flagsConfig: FlagsConfig = {
    package: flags.string({
      char: 'p',
      description: messages.getMessage('package'),
      longDescription: messages.getMessage('packageLong'),
      required: true,
    }),
    name: flags.string({
      char: 'n',
      description: messages.getMessage('name'),
      longDescription: messages.getMessage('nameLong'),
    }),
    description: flags.string({
      char: 'd',
      description: messages.getMessage('description'),
      longDescription: messages.getMessage('descriptionLong'),
    }),
    errornotificationusername: flags.string({
      char: 'o',
      description: packageCreate.getMessage('errorNotificationUsername'),
      longDescription: packageCreate.getMessage('errorNotificationUsernameLong'),
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const pkg = new Package({ connection: this.hubOrg.getConnection() });
    const id = getPackageIdFromAlias(this.flags.package, this.project);
    validateId(BY_LABEL.PACKAGE_ID, id);

    const result = await pkg.update({
      Id: id,
      Name: this.flags.name as string,
      Description: this.flags.description as string,
      PackageErrorUsername: this.flags.errornotificationusername as string,
    });

    this.ux.log(messages.getMessage('success', [id]));

    return result;
  }
}
