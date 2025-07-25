/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core/messages';
import { Package } from '@salesforce/packaging';
import { requiredHubFlag } from '../../../utils/hubFlag.js';
import { maybeGetProject } from '../../../utils/getProject.js';

// Import i18n messages
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_displaydependencies');
export type DisplayDependenciesCommandResult = string | void;

export class PackageVersionDisplayDependenciesCommand extends SfCommand<DisplayDependenciesCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;

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
    'edge-direction': Flags.custom<'root-first' | 'root-last'>({
      options: ['root-first', 'root-last'],
    })({
      summary: messages.getMessage('flags.edge-direction.summary'),
      description: messages.getMessage('flags.edge-direction.description'),
      default: 'root-first',
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
      default: false,
    }),
  };

  public async run(): Promise<DisplayDependenciesCommandResult> {
    const { flags } = await this.parse(PackageVersionDisplayDependenciesCommand);
    const packageDependencyGraph = await Package.getDependencyGraph(
      flags.package,
      await maybeGetProject(),
      flags['target-dev-hub'].getConnection(flags['api-version']),
      {
        verbose: flags['verbose'],
        edgeDirection: flags['edge-direction'],
      }
    );

    const dotProducer = await packageDependencyGraph.getDependencyDotProducer();
    const dotCodeResult = dotProducer.produce();

    if (flags.json) {
      return dotCodeResult;
    }
    this.log(dotCodeResult);
  }
}
