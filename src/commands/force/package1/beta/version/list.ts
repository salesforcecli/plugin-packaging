/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfError } from '@salesforce/core';
import { package1VersionList, Package1Display } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package1_version_list');

export class Package1VersionListCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly longDescription = messages.getMessage('longDescription');
  public static readonly help = messages.getMessage('cliHelp');
  public static readonly requiresUsername = true;
  public static readonly flagsConfig: FlagsConfig = {
    packageid: flags.id({
      char: 'i',
      description: messages.getMessage('packageId'),
      longDescription: messages.getMessage('packageIdLong'),
      validate: (id) => {
        if (id.startsWith('033') && [18, 15].includes(id.length)) {
          return true;
        } else {
          throw new SfError(messages.getMessage('packageIdInvalid'));
        }
      },
    }),
  };

  public async run(): Promise<Package1Display[]> {
    // TODO: remove eslint-disable lines once the `packaging` PR is merged
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
    const result = await package1VersionList(this.org.getConnection(), this.flags.packageid);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,no-unused-expressions
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }
}
