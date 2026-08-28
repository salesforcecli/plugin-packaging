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
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { PackageTrustLink, PackageTrustLinkUnlinkResult } from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_trust_link_unlink');

export class PackageTrustLinkUnlinkCommand extends SfCommand<PackageTrustLinkUnlinkResult> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
  };

  public async run(): Promise<PackageTrustLinkUnlinkResult> {
    const { flags } = await this.parse(PackageTrustLinkUnlinkCommand);
    const connection = flags['target-org'].getConnection(flags['api-version']);

    const result = await PackageTrustLink.unlink(connection);

    if (result.removed) {
      this.log(messages.getMessage('output.removed', [result.VerifiedOrgId, result.Status]));
    } else {
      this.log(messages.getMessage('output.notLinked'));
    }

    return result;
  }
}
