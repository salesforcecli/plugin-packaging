/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfError } from '@salesforce/core';
import { PackageSaveResult, PackageVersion } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_promote');

export class PackageVersionPromoteCommand extends SfdxCommand {
  public static aliases = ['force:package:beta:version:promote'];
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
    noprompt: flags.boolean({
      char: 'n',
      description: messages.getMessage('setasreleasedForce'),
      longDescription: messages.getMessage('setasreleasedForceLong'),
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const packageVersion = new PackageVersion({
      connection: this.hubOrg.getConnection(),
      project: this.project,
      idOrAlias: this.flags.package as string,
    });
    const packageVersionData = await packageVersion.getData();

    if (!this.flags.json && !this.flags.noprompt) {
      // Warn when a Managed package has removed metadata
      if (packageVersionData.HasMetadataRemoved) {
        this.ux.warn(messages.getMessage('hasMetadataRemovedWarning'));
      }

      // Prompt for confirmation
      if (
        !(await this.ux.confirm(messages.getMessage('packageVersionPromoteConfirm', [this.flags.package as string])))
      ) {
        return;
      }
    }

    let result: PackageSaveResult;

    try {
      result = await packageVersion.promote();
      result.id = packageVersionData.SubscriberPackageVersionId;
    } catch (e) {
      const err = SfError.wrap(e as Error);
      if (err.name === 'DUPLICATE_VALUE' && err.message.includes('previously released')) {
        err.message = messages.getMessage('previouslyReleasedMessage');
        err.actions = [messages.getMessage('previouslyReleasedAction')];
      }
      throw err;
    }

    this.ux.log(messages.getMessage('humanSuccess', [result.id]));
    return result;
  }
}
