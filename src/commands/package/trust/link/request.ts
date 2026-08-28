/*
 * Copyright 2026, Salesforce, Inc.
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

import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { PackageTrustLink, PackageTrustLinkRequestResult } from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_trust_link_request');

export class PackageTrustLinkRequestCommand extends SfCommand<PackageTrustLinkRequestResult> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    'verified-org': Flags.salesforceId({
      char: 'i',
      startsWith: '00D',
      length: 'both',
      summary: messages.getMessage('flags.verified-org.summary'),
      required: true,
    }),
  };

  public async run(): Promise<PackageTrustLinkRequestResult> {
    const { flags } = await this.parse(PackageTrustLinkRequestCommand);
    const connection = flags['target-org'].getConnection(flags['api-version']);

    const result = await PackageTrustLink.request(connection, { verifiedOrgId: flags['verified-org'] });

    this.log(messages.getMessage('output', [result.VerifiedOrgId, result.LinkRequestId]));

    return result;
  }
}
