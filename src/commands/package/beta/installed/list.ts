/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { Messages } from '@salesforce/core';
import {
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { CliUx } from '@oclif/core';
import { SubscriberPackageVersion } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_installed_list');

export type PackageInstalledListResult = {
  Id: string;
  SubscriberPackageId: string;
  SubscriberPackageName: string;
  SubscriberPackageNamespace: string;
  SubscriberPackageVersionId: string;
  SubscriberPackageVersionName: string;
  SubscriberPackageVersionNumber: string;
};

export type PackageInstalledCommandResult = PackageInstalledListResult[];

export class PackageInstalledListCommand extends SfCommand<PackageInstalledCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('summary');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly aliases = ['force:package:beta:installed:list'];
  public static readonly requiresProject = true;

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
  };

  public async run(): Promise<PackageInstalledCommandResult> {
    const { flags } = await this.parse(PackageInstalledListCommand);
    const result = await SubscriberPackageVersion.installedList(
      flags['target-org'].getConnection(flags['api-version'])
    );

    const records = result.map((record) => ({
      Id: record.Id,
      SubscriberPackageId: record.SubscriberPackageId,
      SubscriberPackageName: record.SubscriberPackage?.Name as string,
      SubscriberPackageNamespace: record.SubscriberPackage?.NamespacePrefix as string,
      SubscriberPackageVersionId: record.SubscriberPackageVersion?.Id as string,
      SubscriberPackageVersionName: record.SubscriberPackageVersion?.Name as string,
      SubscriberPackageVersionNumber: `${record.SubscriberPackageVersion?.MajorVersion}.${record.SubscriberPackageVersion?.MinorVersion}.${record.SubscriberPackageVersion?.PatchVersion}.${record.SubscriberPackageVersion?.BuildNumber}`,
    }));

    const tableOptions: CliUx.Table.table.Options = {
      Id: { header: 'ID' },
      SubscriberPackageId: { header: 'Package ID' },
      SubscriberPackageName: { header: 'Package Name' },
      SubscriberPackageNamespace: { header: 'Namespace' },
      SubscriberPackageVersionId: { header: 'Package Version ID' },
      SubscriberPackageVersionName: { header: 'Version Name' },
      SubscriberPackageVersionNumber: { header: 'Version' },
    };
    this.table(records, tableOptions, { 'no-truncate': true });

    return records;
  }
}
