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
import { Package, PackageAncestryNodeData } from '@salesforce/packaging';

// Import i18n messages
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_displayancestry');

export type DisplayAncestryCommandResult = PackageAncestryNodeData | string | void;

export class PackageVersionDisplayAncestryCommand extends SfCommand<DisplayAncestryCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = [
    'force:package:beta:version:displayancestry',
    'force:package:version:displayancestry',
  ];
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
    'dot-code': Flags.boolean({
      aliases: ['dotcode'],
      deprecateAliases: true,
      summary: messages.getMessage('dotcode'),
      description: messages.getMessage('dotcode-long'),
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('verbose'),
      description: messages.getMessage('verbose-long'),
    }),
  };

  public async run(): Promise<DisplayAncestryCommandResult> {
    const { flags } = await this.parse(PackageVersionDisplayAncestryCommand);
    const packageAncestry = await Package.getAncestry(
      flags.package,
      this.project,
      flags['target-hub-org'].getConnection(flags['api-version'])
    );
    const jsonProducer = packageAncestry.getJsonProducer();
    if (flags['dot-code']) {
      const dotProducer = packageAncestry.getDotProducer();
      const dotCodeResult = dotProducer.produce<string | void>();
      if (flags.json) {
        return dotCodeResult;
      } else {
        this.log(dotCodeResult as string);
      }
    } else {
      if (packageAncestry.requestedPackageId.startsWith('04t')) {
        const paths = packageAncestry.getLeafPathToRoot(packageAncestry.requestedPackageId);
        this.log(`${paths[0].map((p) => p.getVersion()).join(' -> ')} (root)`);
        this.log();
      }
      const treeProducer = packageAncestry.getTreeProducer(flags.verbose);
      if (!flags.json) {
        treeProducer.produce();
      }
    }
    return jsonProducer.produce();
  }
}