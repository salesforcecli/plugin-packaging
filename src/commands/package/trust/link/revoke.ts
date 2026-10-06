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

import { Messages } from '@salesforce/core';
import { PackageTrustLink, PackageTrustLinkRevokeOptions, PackageTrustLinkRevokeResult } from '@salesforce/packaging';
import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_trust_link_revoke');

export class PackageTrustLinkRevokeCommand extends SfCommand<PackageTrustLinkRevokeResult> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    request: Flags.salesforceId({
      char: 'r',
      startsWith: '2vt',
      length: 'both',
      exactlyOne: ['request', 'authoring-org'],
      summary: messages.getMessage('flags.request.summary'),
    }),
    'authoring-org': Flags.salesforceId({
      char: 'a',
      startsWith: '00D',
      length: 'both',
      exactlyOne: ['request', 'authoring-org'],
      summary: messages.getMessage('flags.authoring-org.summary'),
    }),
  };

  public async run(): Promise<PackageTrustLinkRevokeResult> {
    const { flags } = await this.parse(PackageTrustLinkRevokeCommand);
    const connection = flags['target-org'].getConnection(flags['api-version']);
    const options: PackageTrustLinkRevokeOptions = flags.request
      ? { requestId: flags.request }
      : { authoringOrgId: flags['authoring-org'] };
    const result = await PackageTrustLink.revoke(connection, options);

    this.log(messages.getMessage('output', [result.LinkRequestId, result.AuthoringOrgId]));
    return result;
  }
}
