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
import { Messages, SfError } from '@salesforce/core';
import { PackageSaveResult, PackageVersion } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_promote');

export class PackageVersionPromoteCommand extends SfCommand<PackageSaveResult> {
  public static readonly summary = messages.getMessage('cliDescription');
  public static readonly description = messages.getMessage('cliDescription');

  public static readonly examples = messages.getMessage('examples').split(os.EOL);

  public static readonly requiresProject = true;
  public static readonly flags = {
    loglevel,
    'target-hub-org': requiredHubFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('package'),
      description: messages.getMessage('packageLong'),
      required: true,
    }),
    'no-prompt': Flags.boolean({
      char: 'n',
      aliases: ['noprompt'],
      summary: messages.getMessage('setasreleasedForce'),
      description: messages.getMessage('setasreleasedForceLong'),
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const { flags } = await this.parse(PackageVersionPromoteCommand);
    const packageVersion = new PackageVersion({
      connection: flags['target-hub-org'].getConnection(flags['api-version']),
      project: this.project,
      idOrAlias: flags.package,
    });
    const packageVersionData = await packageVersion.getData();

    if (!flags.json && !flags['no-prompt']) {
      // Warn when a Managed package has removed metadata
      if (packageVersionData.HasMetadataRemoved) {
        this.warn(messages.getMessage('hasMetadataRemovedWarning'));
      }

      // Prompt for confirmation
      if (!(await this.confirm(messages.getMessage('packageVersionPromoteConfirm', [flags.package])))) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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

    this.log(messages.getMessage('humanSuccess', [result.id]));
    return result;
  }
}
