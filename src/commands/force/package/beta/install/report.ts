/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { Package, PackagingSObjects } from '@salesforce/packaging';

type PackageInstallRequest = PackagingSObjects.PackageInstallRequest;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install_report');
const installMsgs = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install');

export class Report extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly longDescription = messages.getMessage('cliDescriptionLong');
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

  public async run(): Promise<PackageInstallRequest> {
    const connection = this.org.getConnection();
    const pkg = new Package({ connection });
    const installRequestId = this.flags.requestid as string;
    Package.validateId(installRequestId, 'PackageInstallRequestId');
    const pkgInstallRequest = await pkg.getInstallStatus(installRequestId);
    this.parseStatus(pkgInstallRequest);

    return pkgInstallRequest;
  }

  // @fixme: refactor with install code and any others
  private parseStatus(request: PackageInstallRequest): void {
    const { Status } = request;
    if (Status === 'SUCCESS') {
      this.ux.log(installMsgs.getMessage('packageInstallSuccess', [request.SubscriberPackageVersionKey]));
    } else if (['IN_PROGRESS', 'UNKNOWN'].includes(Status)) {
      this.ux.log(installMsgs.getMessage('packageInstallInProgress', [request.Id, this.org.getUsername()]));
    } else {
      throw installMsgs.createError('packageInstallError', [this.parseInstallErrors(request)]);
    }
  }

  // @fixme: refactor with install code and any others
  private parseInstallErrors(request: PackageInstallRequest): string {
    const errors = request?.Errors?.errors;
    if (errors?.length) {
      let errorMessage = 'Installation errors: ';
      for (let i = 0; i < errors.length; i++) {
        errorMessage += `\n${i + 1}) ${errors[i].message}`;
      }
      return errorMessage;
    }
    return '<empty>';
  }
}
