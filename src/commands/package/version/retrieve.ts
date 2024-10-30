/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from 'node:path';
import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core/messages';
import { Package, PackageVersionMetadataDownloadResult } from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_retrieve');

export type FileDownloadEntry = {
  fullName: string;
  type: string;
  filePath: string;
};

export type PackageVersionRetrieveCommandResult = FileDownloadEntry[];

export class PackageVersionRetrieveCommand extends SfCommand<PackageVersionRetrieveCommandResult> {
  public static readonly hidden = true;
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static readonly flags = {
    loglevel,
    'api-version': orgApiVersionFlagWithDeprecations,
    'target-org': requiredOrgFlagWithDeprecations,
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.package.summary'),
      required: true,
    }),
    'output-dir': Flags.directory({
      char: 'd',
      summary: messages.getMessage('flags.output-dir.summary'),
      default: 'force-app',
    }),
  };

  public async run(): Promise<PackageVersionRetrieveCommandResult> {
    const { flags } = await this.parse(PackageVersionRetrieveCommand);
    const connection = flags['target-org'].getConnection(flags['api-version']);
    const options = {
      subscriberPackageVersionId: flags.package ?? '',
      destinationFolder: flags['output-dir'],
    };

    const result: PackageVersionMetadataDownloadResult = await Package.downloadPackageVersionMetadata(
      this.project!,
      options,
      connection
    );
    const results: PackageVersionRetrieveCommandResult = [];

    result.converted?.forEach((component) => {
      if (component.xml) {
        results.push({
          fullName: component.fullName,
          type: component.type.name,
          filePath: path.relative('.', component.xml),
        });
      }
      if (component.content) {
        results.push({
          fullName: component.fullName,
          type: component.type.name,
          filePath: path.relative('.', component.content),
        });
      }
    });

    this.table({
      data: results,
      columns: [
        { key: 'fullName', name: messages.getMessage('headers.fullName') },
        { key: 'type', name: messages.getMessage('headers.type') },
        { key: 'filePath', name: messages.getMessage('headers.filePath') },
      ],
      overflow: 'wrap',
    });

    return results;
  }
}
