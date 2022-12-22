/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import {
  Flags,
  orgApiVersionFlagWithDeprecations,
  requiredHubFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { PackageVersion, PackageVersionCreateRequestResult } from '@salesforce/packaging';
import * as chalk from 'chalk';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create_list');
const packaging = Messages.loadMessages('@salesforce/plugin-packaging', 'packaging');

export class PackageVersionCreateListCommand extends SfCommand<PackageVersionCreateRequestResult[]> {
  public static readonly summary = messages.getMessage('cliDescription');
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);

  public static readonly flags = {
    'target-hub-org': requiredHubFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    createdlastdays: Flags.integer({
      char: 'c',
      summary: packaging.getMessage('createdLastDaysDescription'),
      description: packaging.getMessage('createdLastDaysLongDescription'),
    }),
    status: Flags.enum({
      char: 's',
      summary: messages.getMessage('statusDescription'),
      description: messages.getMessage('statusLongDescription'),
      options: ['Queued', 'InProgress', 'Success', 'Error'],
    }),
  };

  public async run(): Promise<PackageVersionCreateRequestResult[]> {
    const { flags } = await this.parse(PackageVersionCreateListCommand);
    const connection = flags['target-hub-org'].getConnection(flags['api-version']);
    const results = await PackageVersion.getPackageVersionCreateRequests(connection, {
      createdlastdays: flags.createdlastdays,
      status: flags.status as 'Queued' | 'InProgress' | 'Success' | 'Error',
      connection,
    });

    if (results.length === 0) {
      this.log('No results found');
    } else {
      this.styledHeader(chalk.blue(`Package Version Create Requests  [${results.length}]`));
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
      this.table(results, columnData, { 'no-truncate': true });
    }

    return results;
  }
}
