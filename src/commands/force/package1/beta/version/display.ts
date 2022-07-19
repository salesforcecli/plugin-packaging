/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfError } from '@salesforce/core';
import { Package1Display, package1Display } from '@salesforce/packaging';
import { CliUx } from '@oclif/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package1_version_display');

export class Package1VersionDisplayCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('description');
  public static readonly help = messages.getMessage('help');
  public static readonly requiresUsername = true;
  public static readonly flagsConfig: FlagsConfig = {
    packageversionid: flags.id({
      char: 'i',
      description: messages.getMessage('packageId'),
      longDescription: messages.getMessage('packageIdLong'),
      required: true,
      validate: (id) => {
        if (id.startsWith('04t') && [18, 15].includes(id.length)) {
          return true;
        } else {
          throw new SfError(messages.getMessage('packageIdInvalid'));
        }
      },
    }),
  };

  public async run(): Promise<Package1Display[]> {
    const conn = this.org.getConnection();
    const results = await package1Display(conn, this.flags.packageversionid);

    if (!this.flags.json) {
      if (results.length === 0) {
        CliUx.ux.log('No results found');
      } else {
        CliUx.ux.table(results, {
          MetadataPackageVersionId: { header: 'MetadataPackageVersionId' },
          MetadataPackageId: { header: 'MetadataPackageId' },
          Name: { header: 'Name' },
          Version: { header: 'Version' },
          ReleaseState: { header: 'ReleaseState' },
          BuildNumber: { header: 'BuildNumber' },
        });
      }
    }

    return results;
  }
}
