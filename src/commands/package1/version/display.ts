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
