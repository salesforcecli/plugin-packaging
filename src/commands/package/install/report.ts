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
import { Messages, Org } from '@salesforce/core';
import { PackagingSObjects, SubscriberPackageVersion } from '@salesforce/packaging';

export type PackageInstallRequest = PackagingSObjects.PackageInstallRequest;

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install_report');
const installMsgs = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install');

export class Report extends SfCommand<PackageInstallRequest> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:install:report'];
  public static org: Org;

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    loglevel,
    'request-id': Flags.salesforceId({
      startsWith: '0Hf',
      length: 'both',
      char: 'i',
      deprecateAliases: true,
      aliases: ['requestid'],
      summary: messages.getMessage('flags.request-id.summary'),
      required: true,
    }),
  };

  public static parseStatus(binName: string, request: PackageInstallRequest, username: string, alias?: string): string {
    const pkgIdOrAlias = alias ?? request.SubscriberPackageVersionKey;
    const { Status } = request;
    if (Status === 'SUCCESS') {
      return installMsgs.getMessage('package-install-success', [pkgIdOrAlias]);
    } else if (['IN_PROGRESS', 'UNKNOWN'].includes(Status)) {
      return installMsgs.getMessage('packageInstallInProgress', [binName, request.Id, username]);
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
    this.log(Report.parseStatus(this.config.bin, pkgInstallRequest, flags['target-org'].getUsername() as string));

    return pkgInstallRequest;
  }
}
