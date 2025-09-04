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

import { Messages } from '@salesforce/core/messages';
import {
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { InstalledPackages, SubscriberPackageVersion } from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_installed_list');

export type PackageInstalledListResult = {
  Id: string;
  SubscriberPackageId?: string;
  SubscriberPackageName?: string;
  SubscriberPackageNamespace?: string;
  SubscriberPackageVersionId?: string;
  SubscriberPackageVersionName?: string;
  SubscriberPackageVersionNumber?: string;
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
    const records = (
      await SubscriberPackageVersion.installedList(flags['target-org'].getConnection(flags['api-version']))
    ).map(transformRow);

    this.table({
      data: records,
      columns: [
        { key: 'Id', name: 'ID' },
        { key: 'SubscriberPackageId', name: 'Package ID' },
        { key: 'SubscriberPackageName', name: 'Package Name' },
        { key: 'SubscriberPackageNamespace', name: 'Namespace' },
        { key: 'SubscriberPackageVersionId', name: 'Package Version ID' },
        { key: 'SubscriberPackageVersionName', name: 'Version Name' },
        { key: 'SubscriberPackageVersionNumber', name: 'Version' },
      ],
      overflow: 'wrap',
    });

    return records;
  }
}

const transformRow = (r: InstalledPackages): PackageInstalledListResult => ({
  Id: r.Id,
  SubscriberPackageId: r.SubscriberPackageId,
  ...(r.SubscriberPackage
    ? {
        SubscriberPackageName: r.SubscriberPackage.Name,
        SubscriberPackageNamespace: r.SubscriberPackage.NamespacePrefix,
      }
    : {}),
  ...(r.SubscriberPackageVersion
    ? {
        SubscriberPackageVersionId: r.SubscriberPackageVersion.Id,
        SubscriberPackageVersionName: r.SubscriberPackageVersion.Name,
        SubscriberPackageVersionNumber: `${r.SubscriberPackageVersion.MajorVersion}.${r.SubscriberPackageVersion.MinorVersion}.${r.SubscriberPackageVersion.PatchVersion}.${r.SubscriberPackageVersion.BuildNumber}`,
      }
    : {}),
});
