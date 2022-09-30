/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfError } from '@salesforce/core';
import {
  BY_LABEL,
  getHasMetadataRemoved,
  getPackageIdFromAlias,
  getPackageVersionId,
  PackageSaveResult,
  PackageVersion,
  validateId,
} from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_promote');

export class PackageVersionPromoteCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');

  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresDevhubUsername = true;
  public static readonly requiresProject = true;
  public static readonly flagsConfig: FlagsConfig = {
    package: flags.string({
      char: 'p',
      description: messages.getMessage('package'),
      longDescription: messages.getMessage('packageLong'),
      required: true,
    }),
    noprompt: flags.boolean({
      char: 'n',
      description: messages.getMessage('setasreleasedForce'),
      longDescription: messages.getMessage('setasreleasedForceLong'),
    }),
  };

  public async run(): Promise<PackageSaveResult> {
    const conn = this.hubOrg.getConnection();
    const packageIdFromAlias =
      getPackageIdFromAlias(this.flags.package as string, this.project) ?? (this.flags.package as string);
    let packageId = packageIdFromAlias;
    // ID can be 04t or 05i at this point
    validateId([BY_LABEL.SUBSCRIBER_PACKAGE_VERSION_ID, BY_LABEL.PACKAGE_VERSION_ID], packageId);

    if (packageId.startsWith('04t')) {
      // lookup the 05i ID for getHasMetadataRemoved below
      packageId = await getPackageVersionId(packageId, conn);
    }

    if (!this.flags.json && !this.flags.noprompt) {
      // Warn when a Managed package has removed metadata
      if (await getHasMetadataRemoved(packageId, conn)) {
        this.ux.warn(messages.getMessage('hasMetadataRemovedWarning'));
      }

      // Prompt for confirmation
      if (
        !(await this.ux.confirm(messages.getMessage('packageVersionPromoteConfirm', [this.flags.package as string])))
      ) {
        return;
      }
    }

    const pkg = new PackageVersion({ connection: conn, project: this.project });
    let result: PackageSaveResult;

    try {
      result = await pkg.promote(packageId);
      result.id = packageIdFromAlias.startsWith('04t') ? packageIdFromAlias : result.id;
    } catch (e) {
      if (!(e instanceof Error) && typeof e !== 'string') {
        throw e;
      }
      const err = SfError.wrap(e);
      if (err.name === 'DUPLICATE_VALUE' && err.message.includes('previously released')) {
        err.message = messages.getMessage('previouslyReleasedMessage');
        err.actions = [messages.getMessage('previouslyReleasedAction')];
      }
      throw err;
    }

    this.ux.log(messages.getMessage('humanSuccess', [result.id]));
    return result;
  }
}
