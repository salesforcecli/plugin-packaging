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
import { PackageAuthorization, PackageAuthorizationRemoveResult } from '@salesforce/packaging';
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
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_authorize_remove');

export type PackageAuthorizeRemoveCommandResult = PackageAuthorizationRemoveResult;

export class PackageAuthorizeRemoveCommand extends SfCommand<PackageAuthorizeRemoveCommandResult> {
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
    'subscriber-org': Flags.salesforceId({
      summary: messages.getMessage('flags.subscriber-org.summary'),
      required: true,
      length: 'both',
      startsWith: '00D',
    }),
  };

  public async run(): Promise<PackageAuthorizeRemoveCommandResult> {
    const { flags } = await this.parse(PackageAuthorizeRemoveCommand);
    const connection = flags['target-org'].getConnection(flags['api-version']);
    const project = flags.package ? await maybeGetProject() : undefined;
    const subscriberPackageId = flags.package
      ? await resolveSubscriberPackageId({ packageAliasOrId: flags.package, connection, project })
      : undefined;
    const result = await new PackageAuthorization({ connection, subscriberPackageId }).remove(flags['subscriber-org']);

    if (result.removed) {
      this.logSuccess(messages.getMessage('success', [flags['subscriber-org']]));
    } else {
      this.log(messages.getMessage('notFound', [flags['subscriber-org']]));
    }
    return result;
  }
}
