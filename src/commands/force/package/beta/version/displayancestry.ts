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
import { Package, PackageAncestryNodeData } from '@salesforce/packaging';

// Import i18n messages
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_displayancestry');

export class PackageVersionDisplayAncestryCommand extends SfCommand<PackageAncestryNodeData | string> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('summary');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly showProgress = false;

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
    dotcode: Flags.boolean({
      summary: messages.getMessage('dotcode'),
      description: messages.getMessage('dotcode-long'),
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('verbose'),
      description: messages.getMessage('verbose-long'),
    }),
  };

  public async run(): Promise<PackageAncestryNodeData | string> {
    const { flags } = await this.parse(PackageVersionDisplayAncestryCommand);
    const packageAncestry = await Package.getAncestry(
      flags.package,
      this.project,
      flags['target-hub-org'].getConnection(flags['api-version'])
    );
    const jsonProducer = packageAncestry.getJsonProducer();
    if (flags.dotcode) {
      const dotProducer = packageAncestry.getDotProducer();
      const dotCodeResult: string = dotProducer.produce() as string;
      if (flags.json) {
        return dotCodeResult;
      } else {
        this.log(dotCodeResult);
      }
    } else {
      if (packageAncestry.requestedPackageId.startsWith('04t')) {
        const paths = packageAncestry.getLeafPathToRoot(packageAncestry.requestedPackageId);
        this.log(`${paths[0].map((p) => p.getVersion()).join(' -> ')} (root)`);
        this.log();
      }
      const treeProducer = packageAncestry.getTreeProducer(!!flags.verbose);
      if (!flags.json) {
        treeProducer.produce();
      }
    }
    return jsonProducer.produce() as PackageAncestryNodeData;
  }
}
