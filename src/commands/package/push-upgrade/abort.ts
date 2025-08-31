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
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { PackagePushUpgrade } from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_pushupgrade_abort');

export type PackagePushUpgradeAbortResult = {
  success: boolean;
};

export class PackagePushUpgradeAbortCommand extends SfCommand<PackagePushUpgradeAbortResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    'target-dev-hub': Flags.requiredHub(),
    'api-version': Flags.orgApiVersion(),
    'push-request-id': Flags.salesforceId({
      length: 'both',
      char: 'i',
      summary: messages.getMessage('flags.push-request-id.summary'),
      required: true,
      startsWith: '0DV',
    }),
  };

  public async run(): Promise<PackagePushUpgradeAbortResult> {
    const { flags } = await this.parse(PackagePushUpgradeAbortCommand);
    const connection = flags['target-dev-hub'].getConnection(flags['api-version']);

    const packagePushRequestOptions = { packagePushRequestId: flags['push-request-id'] };

    const result: boolean = await PackagePushUpgrade.abort(connection, packagePushRequestOptions);

    if (result) {
      this.log(messages.getMessage('output', [flags['push-request-id']]));
    }

    return { success: result };
  }
}
