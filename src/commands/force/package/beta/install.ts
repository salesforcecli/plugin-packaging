/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Lifecycle, Messages, SfProject, SfError, Connection } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import {
  Package,
  PackagingSObjects,
  PackageInstallOptions,
  getPackageTypeBy04t,
  PackageInstallCreateRequest,
} from '@salesforce/packaging';
import { Optional } from '@salesforce/ts-types';
import { QueryResult } from 'jsforce';
type PackageInstallRequest = PackagingSObjects.PackageInstallRequest;
type SubscriberPackageVersion = PackagingSObjects.SubscriberPackageVersion;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install');

// maps of command flag values to PackageInstallRequest values
const securityType = { AllUsers: 'full', AdminsOnly: 'none' };
const upgradeType = { Delete: 'delete-only', DeprecateOnly: 'deprecate-only', Mixed: 'mixed-mode' };

export class Install extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly longDescription = messages.getMessage('cliDescriptionLong');
  public static readonly help = messages.getMessage('help');
  public static readonly;
  public static readonly requiresUsername = true;
  public static readonly flagsConfig: FlagsConfig = {
    wait: flags.minutes({
      char: 'w',
      description: messages.getMessage('wait'),
      longDescription: messages.getMessage('waitLong'),
    }),
    installationkey: flags.string({
      char: 'k',
      description: messages.getMessage('installationKey'),
      longDescription: messages.getMessage('installationKeyLong'),
    }),
    publishwait: flags.minutes({
      char: 'b',
      description: messages.getMessage('publishWait'),
      longDescription: messages.getMessage('publishWaitLong'),
    }),
    noprompt: flags.boolean({
      char: 'r',
      description: messages.getMessage('noPrompt'),
      longDescription: messages.getMessage('noPromptLong'),
    }),
    package: flags.string({
      char: 'p',
      description: messages.getMessage('package'),
      longDescription: messages.getMessage('packageLong'),
      required: true,
    }),
    apexcompile: flags.enum({
      char: 'a',
      description: messages.getMessage('apexCompile'),
      longDescription: messages.getMessage('apexCompileLong'),
      default: 'all',
      options: ['all', 'package'],
    }),
    securitytype: flags.enum({
      char: 's',
      description: messages.getMessage('securityType'),
      longDescription: messages.getMessage('securityTypeLong'),
      default: 'AdminsOnly',
      options: ['AllUsers', 'AdminsOnly'],
    }),
    upgradetype: flags.enum({
      char: 't',
      description: messages.getMessage('upgradeType'),
      longDescription: messages.getMessage('upgradeTypeLong'),
      default: 'Mixed',
      options: ['DeprecateOnly', 'Mixed', 'Delete'],
    }),
  };

  private connection: Connection;
  private pkg: Package;

  public async run(): Promise<PackageInstallRequest> {
    const noPrompt = this.flags.noprompt as boolean;
    this.connection = this.org.getConnection();
    this.pkg = new Package({ connection: this.connection });

    const apiVersion = parseInt(this.connection.getApiVersion(), 10);
    if (apiVersion < 36) {
      throw messages.createError('apiVersionTooLow');
    }

    const request: PackageInstallCreateRequest = {
      SubscriberPackageVersionKey: this.resolveSubscriberPackageVersionKey(this.flags.package),
      Password: this.flags.installationkey as PackageInstallCreateRequest['Password'],
      ApexCompileType: this.flags.apexcompile as PackageInstallCreateRequest['ApexCompileType'],
      SecurityType: securityType[this.flags.securitytype as string] as PackageInstallCreateRequest['SecurityType'],
      UpgradeType: upgradeType[this.flags.upgradetype as string] as PackageInstallCreateRequest['UpgradeType'],
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    Lifecycle.getInstance().on('PackageInstallRequest:warning', async (warningMsg: string) => {
      this.ux.log(warningMsg);
    });

    // If the user has specified --upgradetype Delete, then prompt for confirmation
    // unless the noprompt option has been included.
    if (this.flags.upgradetype === 'Delete') {
      await this.confirmUpgradeType(request, noPrompt);
    }

    // If the package has external sites, ask the user for permission to enable them
    // unless the noprompt option has been included.
    await this.confirmExternalSites(request, noPrompt);

    if (this.flags.publishwait) {
      await this.waitForPublish(request);
    }

    let installOptions: PackageInstallOptions;
    if (this.flags.wait) {
      installOptions = {
        pollingTimeout: this.flags.wait as Duration,
      };

      // eslint-disable-next-line @typescript-eslint/require-await
      Lifecycle.getInstance().on('PackageInstallRequest:status', async (piRequest: PackageInstallRequest) => {
        this.ux.log(messages.getMessage('packageInstallPolling', [piRequest?.Status]));
      });
    }

    const pkgInstallRequest = await this.pkg.install(request, installOptions);
    const { Status } = pkgInstallRequest;
    if (Status === 'SUCCESS') {
      this.ux.log(messages.getMessage('packageInstallSuccess', [this.flags.package]));
    } else if (['IN_PROGRESS', 'UNKNOWN'].includes(Status)) {
      this.ux.log(messages.getMessage('packageInstallInProgress', [pkgInstallRequest.Id, this.org.getUsername()]));
    } else {
      throw messages.createError('packageInstallError', [this.parseInstallErrors(pkgInstallRequest)]);
    }

    return pkgInstallRequest;
  }

  protected async finally(err: Optional<Error>): Promise<void> {
    // Remove all the event listeners or they will still handle events
    Lifecycle.getInstance().removeAllListeners('PackageInstallRequest:warning');
    Lifecycle.getInstance().removeAllListeners('PackageInstallRequest:status');
    Lifecycle.getInstance().removeAllListeners('SubscriberPackageVersion:status');
    await super.finally(err);
  }

  private async confirmUpgradeType(request: PackageInstallCreateRequest, noPrompt: boolean): Promise<void> {
    const pkgType = await getPackageTypeBy04t(request.SubscriberPackageVersionKey, this.connection, request.Password);
    if (pkgType === 'Unlocked' && !noPrompt) {
      const promptMsg = messages.getMessage('promptUpgradeType');
      if (!(await this.ux.confirm(promptMsg))) {
        throw messages.createError('promptUpgradeTypeDeny');
      }
    }
  }

  private async confirmExternalSites(request: PackageInstallCreateRequest, noPrompt: boolean): Promise<void> {
    const extSites = await this.pkg.getExternalSites(request.SubscriberPackageVersionKey);
    if (extSites) {
      let enableRss = true;
      if (!noPrompt) {
        const promptMsg = messages.getMessage('promptEnableRss', [extSites.join('\n')]);
        enableRss = await this.ux.confirm(promptMsg);
      }
      if (enableRss) {
        request.EnableRss = enableRss;
      }
    }
  }

  private async waitForPublish(request: PackageInstallCreateRequest): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/require-await
    Lifecycle.getInstance().on('SubscriberPackageVersion:status', async (status: string) => {
      const tokens = status ? [` Status = ${status}`] : [];
      this.ux.log(messages.getMessage('publishWaitProgress', tokens));
    });

    // wait for the Subscriber Package Version ID to become available in the target org
    try {
      await this.pkg.waitForPublish(request.SubscriberPackageVersionKey, this.flags.publishwait);
    } catch (err) {
      const error = err instanceof SfError ? err : SfError.wrap(err);
      // If an uninstall is in progress, allow install to proceed which will result in an
      // appropriate UninstallInProgressProblem error message being displayed.
      const queryResult = error.data as QueryResult<SubscriberPackageVersion>;
      if (queryResult) {
        const pkgVersion = queryResult.records[0];
        if (pkgVersion.InstallValidationStatus !== 'UNINSTALL_IN_PROGRESS') {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

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

  // Given a package version ID (04t) or an alias for the package, validate and
  // return the package version ID (aka SubscriberPackageVersionKey).
  private resolveSubscriberPackageVersionKey(idOrAlias: string): string {
    let resolvedId: string;

    if (idOrAlias.startsWith('04t')) {
      Package.validateId(idOrAlias, 'SubscriberPackageVersionId');
      resolvedId = idOrAlias;
    } else {
      let packageAliases: { [k: string]: string };
      try {
        const projectJson = SfProject.getInstance().getSfProjectJson();
        packageAliases = projectJson.getContents().packageAliases ?? {};
      } catch (e) {
        throw messages.createError('projectNotFound', [idOrAlias]);
      }
      resolvedId = packageAliases[idOrAlias];
      if (!resolvedId) {
        throw messages.createError('packageAliasNotFound', [idOrAlias]);
      }
      Package.validateId(resolvedId, 'SubscriberPackageVersionId');
    }

    return resolvedId;
  }
}
