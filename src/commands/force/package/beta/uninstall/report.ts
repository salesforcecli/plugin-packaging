/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfError } from '@salesforce/core';
import { Package, PackagingSObjects } from '@salesforce/packaging';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_uninstall_report');
const pkgUninstall = Messages.loadMessages('@salesforce/plugin-packaging', 'package_uninstall');

export class PackageUninstallReportCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresUsername = true;
  public static readonly flagsConfig: FlagsConfig = {
    requestid: flags.id({
      char: 'i',
      description: messages.getMessage('requestId'),
      longDescription: messages.getMessage('requestIdLong'),
      required: true,
      validate: (id) => {
        if (id.startsWith('06y') && [18, 15].includes(id.length)) {
          return true;
        } else {
          throw messages.createError('packageIdInvalid');
        }
      },
    }),
  };

  public async run(): Promise<PackagingSObjects.SubscriberPackageVersionUninstallRequest> {
    const requestId = this.flags.requestid as string;
    const pkg = new Package({ connection: this.org.getConnection() });
    const result = await pkg.uninstallReport(requestId);

    if (result.Status === 'Error') {
      const err = pkgUninstall.getMessage('defaultErrorMessage', [requestId, result.Id]);
      const errorDetails = await this.org
        .getConnection()
        .tooling.query<{ Message: string }>(
          `SELECT Message FROM PackageVersionUninstallRequestError WHERE ParentRequest.Id = '${requestId}' ORDER BY Message`
        );
      const errors: string[] = [];
      errorDetails.records.forEach((record) => {
        errors.push(`(${errors.length + 1}) ${record.Message}`);
      });
      const errHeader = errors.length > 0 ? `\n=== Errors\n${errors.join('\n')}` : '';

      throw new SfError(`${err}${errHeader}`, 'UNINSTALL_ERROR', [pkgUninstall.getMessage('action')]);
    } else {
      const arg =
        result.Status === 'Success' ? [result.SubscriberPackageVersionId] : [result.Id, this.org.getUsername()];
      this.ux.log(messages.getMessage(result.Status, arg));
    }

    return result;
  }
}
