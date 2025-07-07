/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { BundleSObjects, PackageBundleInstall } from '@salesforce/packaging';
import chalk from 'chalk';
import { camelCaseToTitleCase } from '@salesforce/kit';
import { requiredHubFlag } from '../../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_install_report');

export type ReportCommandResult = BundleSObjects.PkgBundleVersionInstallReqResult[];

export class PackageBundleInstallReportCommand extends SfCommand<ReportCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    'target-org': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    // eslint-disable-next-line sf-plugin/id-flag-suggestions
    'package-install-request-id': Flags.salesforceId({
      length: 'both',
      deprecateAliases: true,
      aliases: ['packageinstallrequestid'],
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
    this.display(result, flags.verbose);
    return [result];
  }

  private display(record: BundleSObjects.PkgBundleVersionInstallReqResult, verbose: boolean): void {
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
        value: record.PackageBundleVersionID ?? 'N/A',
      },
      {
        name: messages.getMessage('development-organization'),
        value: record.DevelopmentOrganization,
      },
      {
        name: messages.getMessage('validation-error'),
        value: record.ValidationError ?? 'N/A',
      },
      {
        name: messages.getMessage('created-date'),
        value: record.CreatedDate,
      },
      {
        name: messages.getMessage('created-by'),
        value: record.CreatedById,
      },
      ...(verbose
        ? [
            {
              name: 'ValidationError',
              value: record.ValidationError ?? 'N/A',
            },
          ]
        : []),
    ];

    this.table({ data, title: chalk.blue('Package Bundle Install Request') });
  }
}
