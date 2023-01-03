/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { PackageVersion, PackageVersionCreateRequestResult } from '@salesforce/packaging';
import * as chalk from 'chalk';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create_list');
const packaging = Messages.loadMessages('@salesforce/plugin-packaging', 'packaging');

export class PackageVersionCreateListCommand extends SfdxCommand {
  public static aliases = ['force:package:beta:version:create:list'];
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresDevhubUsername = true;
  public static readonly flagsConfig: FlagsConfig = {
    createdlastdays: flags.number({
      char: 'c',
      description: packaging.getMessage('createdLastDaysDescription'),
      longDescription: packaging.getMessage('createdLastDaysLongDescription'),
    }),
    status: flags.enum({
      char: 's',
      description: messages.getMessage('statusDescription'),
      longDescription: messages.getMessage('statusLongDescription'),
      options: ['Queued', 'InProgress', 'Success', 'Error'],
    }),
  };

  public async run(): Promise<PackageVersionCreateRequestResult[]> {
    const connection = this.hubOrg.getConnection();
    const results = await PackageVersion.getPackageVersionCreateRequests(connection, { ...this.flags });

    if (results.length === 0) {
      this.ux.log('No results found');
    } else {
      this.ux.styledHeader(chalk.blue(`Package Version Create Requests  [${results.length}]`));
      const columnData = {
        Id: {},
        Status: {
          header: messages.getMessage('status'),
        },
        Package2Id: {
          header: messages.getMessage('packageId'),
        },
        Package2VersionId: {
          header: messages.getMessage('packageVersionId'),
        },
        SubscriberPackageVersionId: {
          header: messages.getMessage('subscriberPackageVersionId'),
        },
        Tag: {
          header: messages.getMessage('tag'),
        },
        Branch: {
          header: messages.getMessage('branch'),
        },
        CreatedDate: { header: 'Created Date' },
        CreatedBy: {
          header: messages.getMessage('createdBy'),
        },
      };
      this.ux.table(results, columnData, { 'no-truncate': true });
    }

    return results;
  }
}
