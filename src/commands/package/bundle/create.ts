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
import { BundleCreateOptions, PackageBundle } from '@salesforce/packaging';
import { Messages } from '@salesforce/core';
import { requiredHubFlag } from '../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_create');
export type BundleCreate = { Id: string };

export class PackageBundlesCreate extends SfCommand<BundleCreate> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static readonly flags = {
    loglevel,
    name: Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.name.summary'),
      required: true,
    }),
    description: Flags.string({
      char: 'd',
      summary: messages.getMessage('flags.description.summary'),
    }),
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
  };

  public async run(): Promise<BundleCreate> {
    const { flags } = await this.parse(PackageBundlesCreate);

    const options: BundleCreateOptions = {
      Description: flags.description ?? '',
      BundleName: flags.name,
    };

    this.spinner.start(`Creating Bundle with name ${options.BundleName}`);
    const result = await PackageBundle.create(
      flags['target-dev-hub'].getConnection(flags['api-version']),
      this.project!,
      options
    );

    this.spinner.stop();
    this.table({ data: [{ name: 'Bundle Id', value: result.Id }], title: 'Ids' });

    return result;
  }
}
