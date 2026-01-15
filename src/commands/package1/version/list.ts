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
import { Package1Display, Package1Version } from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package1_version_list');
export type Package1ListCommandResult = Package1Display[];
export class Package1VersionListCommand extends SfCommand<Package1ListCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package1:version:list'];
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    'package-id': Flags.salesforceId({
      length: 18,
      deprecateAliases: true,
      aliases: ['packageid'],
      char: 'i',
      summary: messages.getMessage('flags.package-id.summary'),
      description: messages.getMessage('flags.package-id.description'),
      startsWith: '033',
    }),
  };

  public async run(): Promise<Package1ListCommandResult> {
    const { flags } = await this.parse(Package1VersionListCommand);
    const data = (
      await Package1Version.list(flags['target-org'].getConnection(flags['api-version']), flags['package-id'] as string)
    ).map((record) => ({
      MetadataPackageVersionId: record.Id,
      MetadataPackageId: record.MetadataPackageId,
      Name: record.Name,
      ReleaseState: record.ReleaseState,
      Version: `${record.MajorVersion}.${record.MinorVersion}.${record.PatchVersion}`,
      BuildNumber: record.BuildNumber,
    }));

    if (data.length) {
      this.table({ data });
    } else {
      this.warn('No Results Found');
    }
    return data;
  }
}
