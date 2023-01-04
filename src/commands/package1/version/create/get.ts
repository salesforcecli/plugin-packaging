/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { Package1Version, PackagingSObjects } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package1_version_create_get');

export class Package1VersionCreateGetCommand extends SfCommand<PackagingSObjects.PackageUploadRequest> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly aliases = ['force:package1:beta:version:create:get'];
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    'request-id': Flags.salesforceId({
      aliases: ['requestid'],
      char: 'i',
      summary: messages.getMessage('requestId'),
      description: messages.getMessage('request-id-long'),
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
          : [result.Id, flags['target-org'].getUsername()];
      this.log(messages.getMessage(result.Status, arg));
    }

    return result;
  }
}
