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
import { Messages } from '@salesforce/core/messages';
import { PackageAuthorization, PackageAuthorizationRecord } from '@salesforce/packaging';
import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { maybeGetProject } from '../../../utils/getProject.js';
import { resolveSubscriberPackageId } from '../../../utils/packageAuthorization.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_authorize_list');

export type PackageAuthorizeListCommandResult = PackageAuthorizationRecord[];

export class PackageAuthorizeListCommand extends SfCommand<PackageAuthorizeListCommandResult> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.package.summary'),
    }),
  };

  public async run(): Promise<PackageAuthorizeListCommandResult> {
    const { flags } = await this.parse(PackageAuthorizeListCommand);
    const connection = flags['target-org'].getConnection(flags['api-version']);
    const project = flags.package ? await maybeGetProject() : undefined;
    const subscriberPackageId = flags.package
      ? await resolveSubscriberPackageId({ packageAliasOrId: flags.package, connection, project })
      : undefined;
    const records = await new PackageAuthorization({ connection, subscriberPackageId }).list();

    this.table({
      data: records,
      columns: [
        { key: 'SubscriberOrg', name: messages.getMessage('columns.subscriber-org') },
        { key: 'SubscriberPackageId', name: messages.getMessage('columns.subscriber-package') },
        { key: 'Status', name: messages.getMessage('columns.status') },
        { key: 'CreatedDate', name: messages.getMessage('columns.created-date') },
        { key: 'CreatedByUsername', name: messages.getMessage('columns.created-by') },
      ],
    });
    return records;
  }
}
