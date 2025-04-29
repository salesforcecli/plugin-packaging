/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { PackagePushUpgrade } from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_pushupgrade_abort');

export class PackagePushUpgradeAbortCommand extends SfCommand<boolean> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly flags = {
    'target-dev-hub': Flags.requiredHub(),
    'api-version': Flags.orgApiVersion(),
    // eslint-disable-next-line sf-plugin/id-flag-suggestions
    'push-request-id': Flags.salesforceId({
      length: 'both',
      char: 'i',
      summary: messages.getMessage('flags.push-request-id.summary'),
      required: true,
      startsWith: '0DV',
    }),
  };

  public async run(): Promise<boolean> {
    const { flags } = await this.parse(PackagePushUpgradeAbortCommand);
    const connection = flags['target-dev-hub'].getConnection(flags['api-version']);

    const packagePushRequestOptions = { packagePushRequestId: flags['push-request-id'] };

    const result: boolean = await PackagePushUpgrade.abort(connection, packagePushRequestOptions);

    if (result) {
      this.log(messages.getMessage('output', [flags['push-request-id']]));
    }

    return result;
  }
}
