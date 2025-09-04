/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core/messages';
import { Package } from '@salesforce/packaging';
import { requiredHubFlag } from '../../../utils/hubFlag.js';
import { maybeGetProject } from '../../../utils/getProject.js';

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
