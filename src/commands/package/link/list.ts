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
import { Messages } from '@salesforce/core/messages';
import { PackageLink, PackageLinkListStatusFilter, PackageLinkRecord } from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_link_list');

export type PackageLinkListCommandResult = PackageLinkRecord[];

export class PackageLinkListCommand extends SfCommand<PackageLinkListCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    status: Flags.custom<PackageLinkListStatusFilter>({
      options: ['pending', 'approved', 'declined', 'revoked'],
    })({
      char: 's',
      summary: messages.getMessage('flags.status.summary'),
      description: messages.getMessage('flags.status.description'),
    }),
  };

  public async run(): Promise<PackageLinkListCommandResult> {
    const { flags } = await this.parse(PackageLinkListCommand);
    const connection = flags['target-org'].getConnection(flags['api-version']);
    const results = await new PackageLink({ connection }).list(flags.status);

    if (results.length === 0) {
      this.warn('No results found');
    } else {
      this.table({
        data: results.map((r) => ({
          Id: r.Id,
          'Requested By': r.RequestedBy ?? '',
          'Authoring Org': r.AuthoringOrg,
          Status: r.Status,
          'Request Date': r.CreatedDate,
        })),
        title: `Link Requests [${results.length}]`,
        overflow: 'wrap',
      });
    }

    return results;
  }
}
