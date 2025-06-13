/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core/messages';
import { PackageBundle, BundleSObjects } from '@salesforce/packaging';
import chalk from 'chalk';
import { requiredHubFlag } from '../../../utils/hubFlag.js';

// This is a near copy of the package list command, but with the package bundle class and messages.
// If you are looking to copy this command, mabye make an abstract class for the commands that are similar.(please)
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_list');

export type BundleListCommandResult = BundleSObjects.Bundle;
export type BundleListCommandResults = BundleListCommandResult[];

export class BundleListCommand extends SfCommand<BundleListCommandResults> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:bundle:list'];
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  public async run(): Promise<BundleListCommandResults> {
    const { flags } = await this.parse(BundleListCommand);
    const connection = flags['target-dev-hub'].getConnection(flags['api-version']);
    const results = await PackageBundle.list(connection);
    this.displayResults(results, flags.verbose);
    return results;
  }

  private displayResults(results: BundleListCommandResults, verbose = false): void {
    const data = results.map((r) => ({
      'Bundle Name': r.BundleName,
      Id: r.Id,
      Description: r.Description,
      ...(verbose
        ? {
            'Created Date': r.CreatedDate,
            'Created By': r.CreatedById,
            'Last Modified Date': r.LastModifiedDate,
            'Last Modified By': r.LastModifiedById,
            'System Modstamp': r.SystemModstamp,
            'Is Deleted': r.IsDeleted,
          }
        : {}),
    }));
    this.table({ data, title: chalk.blue(`Package Bundles [${results.length}]`) });
  }
}
