/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from '@salesforce/core';
import { SfdxCommand } from '@salesforce/command';
import { packageInstalledList, PackagingSObjects } from '@salesforce/packaging';
import { CliUx } from '@oclif/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_installed_list');

type InstalledPackage = PackagingSObjects.InstalledPackage;

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
  public static readonly longDescription = messages.getMessage('cliLongDescription');
  public static readonly help = messages.getMessage('help');
  public static readonly requiresUsername = true;

  public async run(): Promise<PackageInstalledListResult[]> {
    // TODO: fix types once Packaging is published
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const result: InstalledPackage[] = (await packageInstalledList(this.org.getConnection())).records;

    const records: PackageInstalledListResult[] = result.map((record: InstalledPackage) => ({
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
    this.ux.table(records, tableOptions);

    return records;
  }
}
