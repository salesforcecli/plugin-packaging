/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core/messages';
import { Package, PackageAncestryNodeData } from '@salesforce/packaging';
import { requiredHubFlag } from '../../../utils/hubFlag.js';

// Import i18n messages
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_displayancestry');

export type DisplayAncestryCommandResult = PackageAncestryNodeData | string | void;

export class PackageVersionDisplayAncestryCommand extends SfCommand<DisplayAncestryCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:version:displayancestry'];

  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.package.summary'),
      description: messages.getMessage('flags.package.description'),
      required: true,
    }),
    'dot-code': Flags.boolean({
      aliases: ['dotcode'],
      deprecateAliases: true,
      summary: messages.getMessage('flags.dot-code.summary'),
      description: messages.getMessage('flags.dot-code.description'),
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  public async run(): Promise<DisplayAncestryCommandResult> {
    const { flags } = await this.parse(PackageVersionDisplayAncestryCommand);
    const packageAncestry = await Package.getAncestry(
      flags.package,
      this.project,
      flags['target-dev-hub'].getConnection(flags['api-version'])
    );
    const jsonProducer = packageAncestry.getJsonProducer();
    if (flags['dot-code']) {
      const dotProducer = packageAncestry.getDotProducer();
      const dotCodeResult = dotProducer.produce();
      if (flags.json) {
        return dotCodeResult;
      } else {
        this.log(dotCodeResult as string);
      }
    } else {
      if (packageAncestry.requestedPackageId?.startsWith('04t')) {
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
