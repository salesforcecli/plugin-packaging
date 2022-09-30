/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { Package1Display, package1VersionList } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package1_version_list');

export class Package1VersionListCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly requiresUsername = true;
  public static readonly flagsConfig: FlagsConfig = {
    packageid: flags.id({
      char: 'i',
      description: messages.getMessage('packageId'),
      longDescription: messages.getMessage('packageIdLong'),
      validate: (id) => {
        if (/^033.{12,15}$/.test(id)) {
          return true;
        } else {
          throw messages.createError('packageIdInvalid');
        }
      },
    }),
  };

  public async run(): Promise<Package1Display[]> {
    const result = await package1VersionList(this.org.getConnection(), this.flags.packageid as string);

    if (result.length) {
      this.ux.table(result, {
        MetadataPackageVersionId: { header: 'MetadataPackageVersionId' },
        MetadataPackageId: { header: 'MetadataPackageId' },
        Name: { header: 'Name' },
        Version: { header: 'Version' },
        ReleaseState: { header: 'ReleaseState' },
        BuildNumber: { header: 'BuildNumber' },
      });
    } else {
      this.ux.log('No Results Found');
    }
    return result;
  }
}
