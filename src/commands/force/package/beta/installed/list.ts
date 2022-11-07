/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { Messages } from '@salesforce/core';
import { SfdxCommand } from '@salesforce/command';
import { CliUx } from '@oclif/core';
import { Package } from '@salesforce/packaging';

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

export class PackageInstalledListCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresUsername = true;
  public static readonly requiresProject = true;

  public async run(): Promise<PackageInstalledListResult[]> {
    const result = await Package.installedList(this.org.getConnection());

    const records = result.map((record) => ({
      Id: record.Id,
      SubscriberPackageId: record.SubscriberPackageId,
      SubscriberPackageName: record.SubscriberPackage.Name,
      SubscriberPackageNamespace: record.SubscriberPackage.NamespacePrefix,
      SubscriberPackageVersionId: record.SubscriberPackageVersion.Id,
      SubscriberPackageVersionName: record.SubscriberPackageVersion.Name,
      SubscriberPackageVersionNumber: `${record.SubscriberPackageVersion.MajorVersion}.${record.SubscriberPackageVersion.MinorVersion}.${record.SubscriberPackageVersion.PatchVersion}.${record.SubscriberPackageVersion.BuildNumber}`,
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
    this.ux.table(records, tableOptions, { 'no-truncate': true });

    return records;
  }
}
