/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import { PackageSaveResult, PackageVersion } from '@salesforce/packaging';
import { requiredHubFlag } from '../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_promote');

export class PackageVersionPromoteCommand extends SfCommand<PackageSaveResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:version:promote'];
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.package.summary'),
      required: true,
    }),
    'no-prompt': Flags.boolean({
      char: 'n',
      deprecateAliases: true,
      aliases: ['noprompt'],
      summary: messages.getMessage('flags.no-prompt.summary'),
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const { flags } = await this.parse(PackageVersionPromoteCommand);
    const packageVersion = new PackageVersion({
      connection: flags['target-dev-hub'].getConnection(flags['api-version']),
      project: this.project!,
      idOrAlias: flags.package,
    });
    const packageVersionData = await packageVersion.getData();

    if (!flags.json && !flags['no-prompt']) {
      // Warn when a Managed package has removed metadata
      if (packageVersionData.HasMetadataRemoved) {
        this.warn(messages.getMessage('hasMetadataRemovedWarning'));
      }

      // Prompt for confirmation
      if (!(await this.confirm({ message: messages.getMessage('packageVersionPromoteConfirm', [flags.package]) }))) {
        throw messages.createError('promote-deny');
      }
    }

    try {
      const result = await packageVersion.promote();
      result.id = packageVersionData.SubscriberPackageVersionId;
      this.log(messages.getMessage('humanSuccess', [result.id]));
      return result;
    } catch (e) {
      const err = SfError.wrap(e as Error);
      if (err.name === 'DUPLICATE_VALUE' && err.message.includes('previously released')) {
        err.message = messages.getMessage('previouslyReleasedMessage');
        err.actions = [messages.getMessage('previouslyReleasedAction', [this.config.bin, this.config.bin])];
      }
      throw err;
    }
  }
}
