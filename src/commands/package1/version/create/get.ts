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
import { Messages } from '@salesforce/core/messages';
import { Package1Version, PackagingSObjects } from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package1_version_create_get');

export class Package1VersionCreateGetCommand extends SfCommand<PackagingSObjects.PackageUploadRequest> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package1:version:create:get'];
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    'request-id': Flags.salesforceId({
      startsWith: '0HD',
      length: 'both',
      deprecateAliases: true,
      aliases: ['requestid'],
      char: 'i',
      summary: messages.getMessage('flags.request-id.summary'),
      required: true,
    }),
  };

  public async run(): Promise<PackagingSObjects.PackageUploadRequest> {
    const { flags } = await this.parse(Package1VersionCreateGetCommand);
    const result = await Package1Version.getCreateStatus(
      flags['target-org'].getConnection(flags['api-version']),
      flags['request-id']
    );

    if (result.Status === 'ERROR') {
      // toolbelt was accessing request.Errors.errors, I'm unsure about this type, but was unable to reproduce an error
      // in the wild, and decided to trust how it was working
      const errors = (result.Errors as unknown as { errors: Error[] })?.errors?.map((e) => e.message).join('\n');
      throw messages.createError('uploadFailure', [errors ?? 'Package version creation failed with unknown error']);
    } else {
      const arg =
        result.Status === 'SUCCESS'
          ? [result.MetadataPackageVersionId]
          : [this.config.bin, result.Id, flags['target-org'].getUsername()];
      this.log(messages.getMessage(result.Status, arg));
    }

    return result;
  }
}
