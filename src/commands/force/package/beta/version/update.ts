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
    versionname: Flags.string({
      char: 'a',
      summary: messages.getMessage('name'),
      description: messages.getMessage('nameLong'),
    }),
    versiondescription: Flags.string({
      char: 'e',
      summary: messages.getMessage('description'),
      description: messages.getMessage('descriptionLong'),
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
    installationkey: Flags.string({
      char: 'k',
      summary: messages.getMessage('key'),
      description: messages.getMessage('longKey'),
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
      VersionDescription: flags.versiondescription,
      Branch: flags.branch,
      InstallKey: flags.installationkey,
      VersionName: flags.versionname,
      Tag: flags.tag,
    });

    this.log(messages.getMessage('success', [result.id]));

    return result;
  }
}
