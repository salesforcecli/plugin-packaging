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
import { PackageSaveResult, PackageVersion } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_update');

export class PackageVersionUpdateCommand extends SfCommand<PackageSaveResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('summary');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);

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
    'version-name': Flags.string({
      char: 'a',
      summary: messages.getMessage('version-name'),
      description: messages.getMessage('version-name-long'),
    }),
    'version-description': Flags.string({
      char: 'e',
      summary: messages.getMessage('version-description'),
      description: messages.getMessage('version-description-long'),
    }),
    branch: Flags.string({
      char: 'b',
      summary: messages.getMessage('branch'),
      description: messages.getMessage('branchLong'),
    }),
    tag: Flags.string({
      char: 't',
      summary: messages.getMessage('tag'),
      description: messages.getMessage('tagLong'),
    }),
    'installation-key': Flags.string({
      char: 'k',
      summary: messages.getMessage('installation-key'),
      description: messages.getMessage('installation-key-long'),
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const { flags } = await this.parse(PackageVersionUpdateCommand);
    const pv = new PackageVersion({
      connection: flags['target-hub-org'].getConnection(flags['api-version']),
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

    this.log(messages.getMessage('success', [result.id]));

    return result;
  }
}
