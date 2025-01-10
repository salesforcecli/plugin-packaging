/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from 'node:fs/promises';
import * as csv from 'csv-parse/sync';
import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import { PackagePushUpgrade, PackagePushUpgradeAbortResult } from '@salesforce/packaging';
import { requiredHubFlag } from '../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_pushupgrade_abort');

export class PackagePushUpgradeAbortCommand extends SfCommand<PackagePushUpgradeAbortResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  // public static readonly hidden = true;
  // public static state = 'beta';
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:pushupgrade:abort'];
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    // eslint-disable-next-line sf-plugin/id-flag-suggestions
    'package-push-request-id': Flags.salesforceId({
      length: 'both',
      deprecateAliases: true,
      aliases: ['packagepushrequestid'],
      char: 'i',
      summary: messages.getMessage('flags.package-push-request-id.summary'),
      required: true,
    }),
  };

  public async run(): Promise<PackagePushUpgradeAbortResult> {
    const { flags } = await this.parse(PackagePushUpgradeAbortCommand);
    const connection = flags['target-dev-hub'].getConnection(flags['api-version']);

    const packagePushRequestOptions = { packagePushRequestId: flags['package-push-request-id'] };

    // Schedule the push upgrade
    const result = await PackagePushUpgrade.abort(connection, packagePushRequestOptions);

    return result;
  }
}