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
import { PackageAuthorization, PackageAuthorizationAddResult } from '@salesforce/packaging';
import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { maybeGetProject } from '../../../utils/getProject.js';
import { resolveSubscriberPackageId } from '../../../utils/packageAuthorization.js';
import { parseSubscriberOrgFile, parseSubscriberOrgList } from '../../../utils/subscriberOrg.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_authorize_add');

export type PackageAuthorizeAddCommandResult = PackageAuthorizationAddResult[];

export class PackageAuthorizeAddCommand extends SfCommand<PackageAuthorizeAddCommandResult> {
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
    'subscriber-org': Flags.string({
      summary: messages.getMessage('flags.subscriber-org.summary'),
      exactlyOne: ['subscriber-org-file-list'],
    }),
    'subscriber-org-file-list': Flags.file({
      summary: messages.getMessage('flags.subscriber-org-file-list.summary'),
      exists: true,
      exactlyOne: ['subscriber-org'],
    }),
  };

  public async run(): Promise<PackageAuthorizeAddCommandResult> {
    const { flags } = await this.parse(PackageAuthorizeAddCommand);
    const connection = flags['target-org'].getConnection(flags['api-version']);
    const project = flags.package ? await maybeGetProject() : undefined;
    const subscriberPackageId = flags.package
      ? await resolveSubscriberPackageId({ packageAliasOrId: flags.package, connection, project })
      : undefined;
    const subscriberOrgs =
      typeof flags['subscriber-org'] === 'string'
        ? parseSubscriberOrgList(flags['subscriber-org'])
        : await parseSubscriberOrgFile(flags['subscriber-org-file-list']!);

    if (subscriberOrgs.length === 0) {
      throw messages.createError('errorNoSubscriberOrgs');
    }

    const results = await new PackageAuthorization({ connection, subscriberPackageId }).add(subscriberOrgs);
    this.table({
      data: results,
      columns: [
        { key: 'SubscriberOrg', name: messages.getMessage('columns.subscriber-org') },
        { key: 'Id', name: messages.getMessage('columns.id') },
      ],
    });
    this.logSuccess(messages.getMessage('success', [results.length]));
    return results;
  }
}
