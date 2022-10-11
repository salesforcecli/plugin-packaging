/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand, UX } from '@salesforce/command';
import { Connection, Lifecycle, Messages } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import {
  PackageEvents,
  PackageInstallCreateRequest,
  PackageInstallOptions,
  PackagingSObjects,
  SubscriberPackageVersion,
} from '@salesforce/packaging';
import { Optional } from '@salesforce/ts-types';
import { resolveSubscriberPackageVersionId } from '../../../../util';

type PackageInstallRequest = PackagingSObjects.PackageInstallRequest;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install');

// maps of command flag values to PackageInstallRequest values
const securityType = { AllUsers: 'full', AdminsOnly: 'none' };
const upgradeType = { Delete: 'delete-only', DeprecateOnly: 'deprecate-only', Mixed: 'mixed-mode' };

export class Install extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresUsername = true;
  public static readonly requiresProject: false;
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
  private subscriberPackageVersion: SubscriberPackageVersion;

  public static parseStatus(
    request: PackageInstallRequest,
    ux: UX,
    installMsgs: Messages<string>,
    username: string,
    alias?: string
  ): void {
    const pkgIdOrAlias = alias ?? request.SubscriberPackageVersionKey;
    const { Status } = request;
    if (Status === 'SUCCESS') {
      ux.log(installMsgs.getMessage('packageInstallSuccess', [pkgIdOrAlias]));
    } else if (['IN_PROGRESS', 'UNKNOWN'].includes(Status)) {
      ux.log(installMsgs.getMessage('packageInstallInProgress', [request.Id, username]));
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
    const noPrompt = this.flags.noprompt as boolean;
    this.connection = this.org.getConnection();

    const apiVersion = parseInt(this.connection.getApiVersion(), 10);
    if (apiVersion < 36) {
      throw messages.createError('apiVersionTooLow');
    }

    const subscriberPackageVersionId = resolveSubscriberPackageVersionId(this.flags.package);

    this.subscriberPackageVersion = new SubscriberPackageVersion({
      connection: this.connection,
      id: subscriberPackageVersionId,
      password: this.flags.installationkey as string,
    });

    const request: PackageInstallCreateRequest = {
      SubscriberPackageVersionKey: await this.subscriberPackageVersion.getId(),
      Password: this.flags.installationkey as PackageInstallCreateRequest['Password'],
      ApexCompileType: this.flags.apexcompile as PackageInstallCreateRequest['ApexCompileType'],
      SecurityType: securityType[this.flags.securitytype as string] as PackageInstallCreateRequest['SecurityType'],
      UpgradeType: upgradeType[this.flags.upgradetype as string] as PackageInstallCreateRequest['UpgradeType'],
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    Lifecycle.getInstance().on(PackageEvents.install.warning, async (warningMsg: string) => {
      this.ux.log(warningMsg);
    });

    // If the user has specified --upgradetype Delete, then prompt for confirmation
    // unless the noprompt option has been included.
    if (this.flags.upgradetype === 'Delete') {
      await this.confirmUpgradeType(noPrompt);
    }

    // If the package has external sites, ask the user for permission to enable them
    // unless the noprompt option has been included.
    await this.confirmExternalSites(request, noPrompt);

    let installOptions: PackageInstallOptions;
    if (this.flags.wait) {
      installOptions = {
        pollingTimeout: this.flags.wait as Duration,
      };
      let remainingTime = this.flags.wait as Duration;
      let timeThen = Date.now();
      this.ux.startSpinner(messages.getMessage('packageInstallWaiting', [remainingTime.minutes]));

      // waiting for publish to finish
      Lifecycle.getInstance().on(
        PackageEvents.install['subscriber-status'],
        // eslint-disable-next-line @typescript-eslint/require-await
        async (publishStatus: PackagingSObjects.InstallValidationStatus) => {
          const elapsedTime = Duration.milliseconds(Date.now() - timeThen);
          timeThen = Date.now();
          remainingTime = Duration.milliseconds(remainingTime.milliseconds - elapsedTime.milliseconds);
          const status =
            publishStatus === 'NO_ERRORS_DETECTED'
              ? messages.getMessage('availableForInstallation')
              : messages.getMessage('unavailableForInstallation');
          this.ux.setSpinnerStatus(messages.getMessage('packagePublishWaitingStatus', [remainingTime.minutes, status]));
        }
      );
      // waiting for package install to finish
      Lifecycle.getInstance().on(
        PackageEvents.install.status,
        // eslint-disable-next-line @typescript-eslint/require-await
        async (piRequest: PackageInstallRequest) => {
          const elapsedTime = Duration.milliseconds(Date.now() - timeThen);
          timeThen = Date.now();
          remainingTime = Duration.milliseconds(remainingTime.milliseconds - elapsedTime.milliseconds);
          this.ux.setSpinnerStatus(
            messages.getMessage('packageInstallWaitingStatus', [remainingTime.minutes, piRequest.Status])
          );
        }
      );
    }

    const pkgInstallRequest = await this.subscriberPackageVersion.install(request, installOptions);
    this.ux.stopSpinner();
    Install.parseStatus(pkgInstallRequest, this.ux, messages, this.org.getUsername(), this.flags.package);

    return pkgInstallRequest;
  }

  protected async finally(err: Optional<Error>): Promise<void> {
    // Remove all the event listeners or they will still handle events
    Lifecycle.getInstance().removeAllListeners(PackageEvents.install.warning);
    Lifecycle.getInstance().removeAllListeners(PackageEvents.install.status);
    Lifecycle.getInstance().removeAllListeners(PackageEvents.install['subscriber-status']);
    await super.finally(err);
  }

  private async confirmUpgradeType(noPrompt: boolean): Promise<void> {
    if ((await this.subscriberPackageVersion.getPackageType()) === 'Unlocked' && !noPrompt) {
      const promptMsg = messages.getMessage('promptUpgradeType');
      if (!(await this.ux.confirm(promptMsg))) {
        throw messages.createError('promptUpgradeTypeDeny');
      }
    }
  }

  private async confirmExternalSites(request: PackageInstallCreateRequest, noPrompt: boolean): Promise<void> {
    const extSites = await this.subscriberPackageVersion.getExternalSites();
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
}
