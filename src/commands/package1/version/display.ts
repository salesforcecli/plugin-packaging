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
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package1_version_display');

export type Package1DisplayCommandResult = Package1Display[];
export class Package1VersionDisplayCommand extends SfCommand<Package1DisplayCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package1:version:display'];

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    'package-version-id': Flags.salesforceId({
      length: 'both',
      char: 'i',
      deprecateAliases: true,
      aliases: ['packageversionid'],
      summary: messages.getMessage('flags.package-version-id.summary'),
      required: true,
      startsWith: '04t',
    }),
  };

  public async run(): Promise<Package1DisplayCommandResult> {
    const { flags } = await this.parse(Package1VersionDisplayCommand);
    const pv1 = new Package1Version(
      flags['target-org'].getConnection(flags['api-version']),
      flags['package-version-id']
    );
    const data = (await pv1.getPackageVersion()).map((result) => ({
      MetadataPackageVersionId: result.Id,
      MetadataPackageId: result.MetadataPackageId,
      Name: result.Name,
      ReleaseState: result.ReleaseState,
      Version: `${result.MajorVersion}.${result.MinorVersion}.${result.PatchVersion}`,
      BuildNumber: result.BuildNumber,
    }));

    if (data.length === 0) {
      this.warn('No results found');
    } else {
      this.table({ data });
    }

    return data;
  }
}
