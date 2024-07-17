/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from '@salesforce/core/messages';
import {
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { SubscriberPackageVersion } from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_installed_list');

export type PackageInstalledListResult = {
  Id: string;
  SubscriberPackageId: string | undefined;
  SubscriberPackageName: string | undefined;
  SubscriberPackageNamespace: string | undefined;
  SubscriberPackageVersionId: string | undefined;
  SubscriberPackageVersionName: string | undefined;
  SubscriberPackageVersionNumber: string | undefined;
};

export type PackageInstalledCommandResult = PackageInstalledListResult[];

export class PackageInstalledListCommand extends SfCommand<PackageInstalledCommandResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:installed:list'];

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
      SubscriberPackageName: record.SubscriberPackage?.Name,
      SubscriberPackageNamespace: record.SubscriberPackage?.NamespacePrefix,
      SubscriberPackageVersionId: record.SubscriberPackageVersion?.Id,
      SubscriberPackageVersionName: record.SubscriberPackageVersion?.Name,
      SubscriberPackageVersionNumber: `${record.SubscriberPackageVersion?.MajorVersion}.${record.SubscriberPackageVersion?.MinorVersion}.${record.SubscriberPackageVersion?.PatchVersion}.${record.SubscriberPackageVersion?.BuildNumber}`,
    }));

    this.table(
      records,
      {
        Id: { header: 'ID' },
        SubscriberPackageId: { header: 'Package ID' },
        SubscriberPackageName: { header: 'Package Name' },
        SubscriberPackageNamespace: { header: 'Namespace' },
        SubscriberPackageVersionId: { header: 'Package Version ID' },
        SubscriberPackageVersionName: { header: 'Version Name' },
        SubscriberPackageVersionNumber: { header: 'Version' },
      },
      { 'no-truncate': true }
    );

    return records;
  }
}
