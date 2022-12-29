/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { Package1Display, Package1Version } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package1_version_display');

export class Package1VersionDisplayCommand extends SfCommand<Package1Display[]> {
  public static readonly summary = messages.getMessage('description');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly aliases = ['force:package1:beta:version:display'];

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    'package-version-id': Flags.salesforceId({
      char: 'i',
      aliases: ['packageversionid'],
      summary: messages.getMessage('package-id'),
      description: messages.getMessage('package-id-long'),
      required: true,
      startsWith: '04t',
    }),
  };

  public async run(): Promise<Package1Display[]> {
    const { flags } = await this.parse(Package1VersionDisplayCommand);
    const pv1 = new Package1Version(
      flags['target-org'].getConnection(flags['api-version']),
      flags['package-version-id']
    );
    const results = (await pv1.getPackageVersion()).map((result) => ({
      MetadataPackageVersionId: result.Id,
      MetadataPackageId: result.MetadataPackageId,
      Name: result.Name,
      ReleaseState: result.ReleaseState,
      Version: `${result.MajorVersion}.${result.MinorVersion}.${result.PatchVersion}`,
      BuildNumber: result.BuildNumber,
    }));

    if (results.length === 0) {
      this.log('No results found');
    } else {
      this.table(results, {
        MetadataPackageVersionId: { header: 'MetadataPackageVersionId' },
        MetadataPackageId: { header: 'MetadataPackageId' },
        Name: { header: 'Name' },
        Version: { header: 'Version' },
        ReleaseState: { header: 'ReleaseState' },
        BuildNumber: { header: 'BuildNumber' },
      });
    }

    return results;
  }
}
