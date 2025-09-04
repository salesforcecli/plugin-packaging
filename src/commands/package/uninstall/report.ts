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

import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core/messages';
import { PackagingSObjects, SubscriberPackageVersion } from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_uninstall_report');

export class PackageUninstallReportCommand extends SfCommand<PackagingSObjects.SubscriberPackageVersionUninstallRequest> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:uninstall:report'];
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    // eslint-disable-next-line sf-plugin/id-flag-suggestions
    'request-id': Flags.salesforceId({
      length: 'both',
      deprecateAliases: true,
      aliases: ['requestid'],
      char: 'i',
      summary: messages.getMessage('flags.request-id.summary'),
      required: true,
      startsWith: '06y',
    }),
  };

  public async run(): Promise<PackagingSObjects.SubscriberPackageVersionUninstallRequest> {
    const { flags } = await this.parse(PackageUninstallReportCommand);
    const result = await SubscriberPackageVersion.uninstallStatus(
      flags['request-id'],
      flags['target-org'].getConnection(flags['api-version'])
    );

    const arg =
      result.Status === 'Success'
        ? [result.SubscriberPackageVersionId]
        : [this.config.bin, result.Id, flags['target-org'].getUsername()];
    this.log(messages.getMessage(result.Status, arg));

    return result;
  }
}
