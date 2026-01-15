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
import { Messages, Org } from '@salesforce/core';
import pkgUtils from '@salesforce/packaging';
import { PackageVersion, PackageVersionCreateRequestResult } from '@salesforce/packaging';
import chalk from 'chalk';
import { camelCaseToTitleCase } from '@salesforce/kit';
import { requiredHubFlag } from '../../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create_report');
const pvclMessages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create_list');
const pvlMessages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_list');
const plMessages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_list');
const ERROR_LIMIT = 12;

export type ReportCommandResult = PackageVersionCreateRequestResult[];

export class PackageVersionCreateReportCommand extends SfCommand<ReportCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:version:create:report'];
  public static readonly flags = {
    loglevel,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    // eslint-disable-next-line sf-plugin/id-flag-suggestions
    'package-create-request-id': Flags.salesforceId({
      length: 'both',
      deprecateAliases: true,
      aliases: ['packagecreaterequestid'],
      char: 'i',
      summary: messages.getMessage('flags.package-create-request-id.summary'),
      required: true,
    }),
  };

  public async run(): Promise<ReportCommandResult> {
    const { flags } = await this.parse(PackageVersionCreateReportCommand);
    const result = await PackageVersion.getCreateStatus(
      flags['package-create-request-id'],
      flags['target-dev-hub'].getConnection(flags['api-version'])
    );
    this.display(result, flags['package-create-request-id'], flags['target-dev-hub']);
    return [result];
  }

  private display(record: PackageVersionCreateRequestResult, requestId: string, devOrg: Org): void {
    const installUrlValue =
      record.Status.toString() === 'Success'
        ? `${pkgUtils.INSTALL_URL_BASE.toString()}${record.SubscriberPackageVersionId ?? '<null>'}`
        : '';

    const data = [
      {
        name: pvclMessages.getMessage('id'),
        value: record.Id,
      },
      {
        name: pvclMessages.getMessage('status'),
        value: camelCaseToTitleCase(record.Status),
      },
      {
        name: pvclMessages.getMessage('package-id'),
        value: record.Package2Id,
      },
      {
        name: pvclMessages.getMessage('packageVersionId'),
        value: record.Package2VersionId,
      },
      {
        name: pvclMessages.getMessage('subscriberPackageVersionId'),
        value: record.SubscriberPackageVersionId,
      },
      {
        name: pvclMessages.getMessage('tag'),
        value: record.Tag,
      },
      {
        name: pvclMessages.getMessage('branch'),
        value: record.Branch,
      },
      { name: 'Created Date', value: record.CreatedDate },
      {
        name: pvclMessages.getMessage('installUrl'),
        value: installUrlValue,
      },
      {
        name: plMessages.getMessage('createdBy'),
        value: record.CreatedBy,
      },
    ];

    if (record.ConvertedFromVersionId) {
      data.push({
        name: pvlMessages.getMessage('convertedFromVersionId'),
        value: record.ConvertedFromVersionId,
      });
    }

    this.table({ data, title: chalk.blue('Package Version Create Request') });

    if (record.Error?.length > 0) {
      this.log('');
      const errors: string[] = [];
      record.Error.slice(0, ERROR_LIMIT).forEach((error: string) => {
        errors.push(`(${errors.length + 1}) ${error}`);
      });
      this.styledHeader(chalk.red('Errors'));
      this.warn(errors.join('\n'));

      // Check if errors were truncated.  If so, inform the user with
      // instructions on how to retrieve the remaining errors.
      if (record.Error.length > ERROR_LIMIT) {
        this.warn(messages.getMessage('truncatedErrors', [this.config.bin, requestId, devOrg.getUsername() as string]));
      }
    }
  }
}
