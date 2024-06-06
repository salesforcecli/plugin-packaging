/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
    const result = (
      await Package1Version.list(flags['target-org'].getConnection(flags['api-version']), flags['package-id'] as string)
    ).map((record) => ({
      MetadataPackageVersionId: record.Id,
      MetadataPackageId: record.MetadataPackageId,
      Name: record.Name,
      ReleaseState: record.ReleaseState,
      Version: `${record.MajorVersion}.${record.MinorVersion}.${record.PatchVersion}`,
      BuildNumber: record.BuildNumber,
    }));

    if (result.length) {
      this.table(result, {
        MetadataPackageVersionId: { header: 'MetadataPackageVersionId' },
        MetadataPackageId: { header: 'MetadataPackageId' },
        Name: { header: 'Name' },
        Version: { header: 'Version' },
        ReleaseState: { header: 'ReleaseState' },
        BuildNumber: { header: 'BuildNumber' },
      });
    } else {
      this.warn('No Results Found');
    }
    return result;
  }
}
