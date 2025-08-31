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

import path from 'node:path';
import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredHubFlagWithDeprecations,
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
    'target-dev-hub': requiredHubFlagWithDeprecations,
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
    const connection = flags['target-dev-hub'].getConnection(flags['api-version']);
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
