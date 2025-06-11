/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { BundleCreateOptions, PackageBundle } from '@salesforce/packaging';
import { Messages } from '@salesforce/core';
import { requiredHubFlag } from '../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_create');
export type BundleCreate = { Id: string };

export class PackageBundlesCreate extends SfCommand<BundleCreate> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly aliases = ['force:bundle:create'];
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
