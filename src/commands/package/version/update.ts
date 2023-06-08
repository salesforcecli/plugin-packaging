/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { PackageSaveResult, PackageVersion } from '@salesforce/packaging';
import { requiredHubFlag } from '../../../utils/hubFlag';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_update');

export class PackageVersionUpdateCommand extends SfCommand<PackageSaveResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:version:update'];
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
    'version-name': Flags.string({
      aliases: ['versionname'],
      deprecateAliases: true,
      char: 'a',
      summary: messages.getMessage('flags.version-name.summary'),
    }),
    'version-description': Flags.string({
      aliases: ['versiondescription'],
      deprecateAliases: true,
      char: 'e',
      summary: messages.getMessage('flags.version-description.summary'),
    }),
    branch: Flags.string({
      char: 'b',
      summary: messages.getMessage('flags.branch.summary'),
    }),
    tag: Flags.string({
      char: 't',
      summary: messages.getMessage('flags.tag.summary'),
    }),
    'installation-key': Flags.string({
      aliases: ['installationkey'],
      deprecateAliases: true,
      char: 'k',
      summary: messages.getMessage('flags.installation-key.summary'),
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const { flags } = await this.parse(PackageVersionUpdateCommand);
    const pv = new PackageVersion({
      connection: flags['target-dev-hub'].getConnection(flags['api-version']),
      project: this.project,
      idOrAlias: flags.package,
    });
    const result = await pv.update({
      VersionDescription: flags['version-description'],
      Branch: flags.branch,
      InstallKey: flags['installation-key'],
      VersionName: flags['version-name'],
      Tag: flags.tag,
    });

    this.logSuccess(messages.getMessage('success', [result.id]));

    return result;
  }
}
