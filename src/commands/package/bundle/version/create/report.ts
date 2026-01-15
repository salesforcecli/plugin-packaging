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

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { BundleSObjects, PackageBundleVersionCreate } from '@salesforce/packaging';
import chalk from 'chalk';
import { camelCaseToTitleCase } from '@salesforce/kit';
import { requiredHubFlag } from '../../../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_version_create_report');

export type ReportCommandResult = BundleSObjects.PackageBundleVersionCreateRequestResult[];

export class PackageBundleVersionCreateReportCommand extends SfCommand<ReportCommandResult> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    // eslint-disable-next-line sf-plugin/id-flag-suggestions
    'bundle-version-create-request-id': Flags.salesforceId({
      length: 'both',
      char: 'i',
      summary: messages.getMessage('flags.bundle-version-create-request-id.summary'),
      required: true,
    }),
  };

  public async run(): Promise<ReportCommandResult> {
    const { flags } = await this.parse(PackageBundleVersionCreateReportCommand);
    const result = await PackageBundleVersionCreate.getCreateStatus(
      flags['bundle-version-create-request-id'],
      flags['target-dev-hub'].getConnection(flags['api-version'])
    );
    this.display(result);
    return [result];
  }

  private display(record: BundleSObjects.PackageBundleVersionCreateRequestResult): void {
    const data = [
      {
        name: messages.getMessage('id'),
        value: record.Id,
      },
      {
        name: messages.getMessage('status'),
        value: camelCaseToTitleCase(record.RequestStatus),
      },
      {
        name: messages.getMessage('bundle-id'),
        value: record.PackageBundleId,
      },
      {
        name: messages.getMessage('bundle-version-id'),
        value: record.PackageBundleVersionId,
      },
      {
        name: messages.getMessage('version-name'),
        value: record.VersionName,
      },
      {
        name: messages.getMessage('created-date'),
        value: record.CreatedDate,
      },
      {
        name: messages.getMessage('created-by'),
        value: record.CreatedById,
      },
    ];

    // Add ValidationError if it exists
    if (record.ValidationError) {
      data.push({
        name: messages.getMessage('validation-error'),
        value: record.ValidationError,
      });
    }

    this.table({ data, title: chalk.blue('Package Bundle Version Create Request') });
  }
}
