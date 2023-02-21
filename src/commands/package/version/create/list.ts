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
  requiredHubFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { PackageVersion, PackageVersionCreateRequestResult } from '@salesforce/packaging';
import * as chalk from 'chalk';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create_list');
const packaging = Messages.loadMessages('@salesforce/plugin-packaging', 'packaging');

export type CreateListCommandResult = PackageVersionCreateRequestResult[];

type Status = 'Queued' | 'InProgress' | 'Success' | 'Error';

export class PackageVersionCreateListCommand extends SfCommand<CreateListCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:beta:version:create:list', 'force:package:version:create:list'];
  public static readonly flags = {
    loglevel,
    'target-hub-org': requiredHubFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    'created-last-days': Flags.integer({
      char: 'c',
      deprecateAliases: true,
      aliases: ['createdlastdays'],
      summary: packaging.getMessage('flags.created-last-days.summary'),
    }),
    status: Flags.custom<Status>({
      options: ['Queued', 'InProgress', 'Success', 'Error'],
    })({
      char: 's',
      summary: messages.getMessage('flags.status.summary'),
    }),
  };

  public async run(): Promise<CreateListCommandResult> {
    const { flags } = await this.parse(PackageVersionCreateListCommand);
    const connection = flags['target-hub-org'].getConnection(flags['api-version']);
    const results = await PackageVersion.getPackageVersionCreateRequests(connection, {
      createdlastdays: flags['created-last-days'],
      status: flags.status,
      connection,
    });

    if (results.length === 0) {
      this.warn('No results found');
    } else {
      this.styledHeader(chalk.blue(`Package Version Create Requests  [${results.length}]`));
      const columnData = {
        Id: {},
        Status: {
          header: messages.getMessage('status'),
        },
        Package2Id: {
          header: messages.getMessage('package-id'),
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
