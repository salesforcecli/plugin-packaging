/*
 * Copyright 2025, Salesforce, Inc.
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

import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { BundleSObjects, PackageBundleInstall } from '@salesforce/packaging';
import chalk from 'chalk';
import { camelCaseToTitleCase } from '@salesforce/kit';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_install_report');

export type ReportCommandResult = BundleSObjects.PkgBundleVersionInstallReqResult[];

export class PackageBundleInstallReportCommand extends SfCommand<ReportCommandResult> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    // eslint-disable-next-line sf-plugin/id-flag-suggestions
    'package-install-request-id': Flags.salesforceId({
      length: 'both',
      char: 'i',
      summary: messages.getMessage('flags.package-install-request-id.summary'),
      required: true,
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
      required: false,
    }),
  };

  public async run(): Promise<ReportCommandResult> {
    const { flags } = await this.parse(PackageBundleInstallReportCommand);
    const result = await PackageBundleInstall.getInstallStatus(
      flags['package-install-request-id'],
      flags['target-org'].getConnection(flags['api-version'])
    );
    this.display(result);
    return [result];
  }

  private display(record: BundleSObjects.PkgBundleVersionInstallReqResult): void {
    const data = [
      {
        name: messages.getMessage('id'),
        value: record.Id,
      },
      {
        name: messages.getMessage('status'),
        value: camelCaseToTitleCase(record.InstallStatus),
      },
      {
        name: messages.getMessage('package-bundle-version-id'),
        value: record.PackageBundleVersionId || 'N/A',
      },
      {
        name: messages.getMessage('development-organization'),
        value: record.DevelopmentOrganization || 'N/A',
      },
      {
        name: messages.getMessage('created-date'),
        value: record.CreatedDate,
      },
      {
        name: messages.getMessage('created-by'),
        value: record.CreatedById,
      },
      {
        name: messages.getMessage('validation-error'),
        value: record.ValidationError || 'N/A',
      },
    ];

    this.table({ data, title: chalk.blue('Package Bundle Install Request') });
  }
}
