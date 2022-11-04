/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { Package1Version, PackagingSObjects } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package1_version_create_get');

export class Package1VersionCreateGetCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresUsername = true;
  public static readonly flagsConfig: FlagsConfig = {
    requestid: flags.id({
      char: 'i',
      description: messages.getMessage('requestId'),
      longDescription: messages.getMessage('requestIdLong'),
      required: true,
    }),
  };

  public async run(): Promise<PackagingSObjects.PackageUploadRequest> {
    const result = await Package1Version.getCreateStatus(this.org.getConnection(), this.flags.requestid as string);

    if (result.Status === 'ERROR') {
      // toolbelt was accessing request.Errors.errors, I'm unsure about this type, but was unable to reproduce an error
      // in the wild, and decided to trust how it was working
      const errors = (result.Errors as unknown as { errors: Error[] })?.errors?.map((e) => e.message).join('\n');
      throw messages.createError('uploadFailure', [errors ?? 'Package version creation failed with unknown error']);
    } else {
      const arg = result.Status === 'SUCCESS' ? [result.MetadataPackageVersionId] : [result.Id, this.org.getUsername()];
      this.ux.log(messages.getMessage(result.Status, arg));
    }

    return result;
  }
}
