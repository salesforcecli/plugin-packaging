/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { Messages, Org } from '@salesforce/core';
import { PackagingSObjects, SubscriberPackageVersion } from '@salesforce/packaging';

type PackageInstallRequest = PackagingSObjects.PackageInstallRequest;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install_report');
const installMsgs = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install');

export class Report extends SfCommand<PackageInstallRequest> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('summary');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static org: Org;

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    loglevel,
    'request-id': Flags.salesforceId({
      char: 'i',
      aliases: ['requestid'],
      summary: messages.getMessage('request-id'),
      description: messages.getMessage('request-id-long'),
      required: true,
    }),
  };

  public static parseStatus(request: PackageInstallRequest, username: string, alias?: string): string {
    const pkgIdOrAlias = alias ?? request.SubscriberPackageVersionKey;
    const { Status } = request;
    if (Status === 'SUCCESS') {
      return installMsgs.getMessage('package-install-success', [pkgIdOrAlias]);
    } else if (['IN_PROGRESS', 'UNKNOWN'].includes(Status)) {
      return installMsgs.getMessage('packageInstallInProgress', [request.Id, username]);
    } else {
      let errorMessage = '<empty>';
      const errors = request?.Errors?.errors;
      if (errors?.length) {
        errorMessage = 'Installation errors: ';
        for (let i = 0; i < errors.length; i++) {
          errorMessage += `\n${i + 1}) ${errors[i].message}`;
        }
      }
      throw installMsgs.createError('packageInstallError', [errorMessage]);
    }
  }

  public async run(): Promise<PackageInstallRequest> {
    const { flags } = await this.parse(Report);
    const connection = flags['target-org'].getConnection(flags['api-version']);
    const pkgInstallRequest = await SubscriberPackageVersion.getInstallRequest(flags['request-id'], connection);
    this.log(Report.parseStatus(pkgInstallRequest, flags['target-org'].getUsername() as string));

    return pkgInstallRequest;
  }
}
