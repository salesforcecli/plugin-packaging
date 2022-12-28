/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import {
  Flags,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
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
import { Report } from './install/report';

type PackageInstallRequest = PackagingSObjects.PackageInstallRequest;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install');

// maps of command flag values to PackageInstallRequest values
const securityType = { AllUsers: 'full', AdminsOnly: 'none' };
const upgradeType = { Delete: 'delete-only', DeprecateOnly: 'deprecate-only', Mixed: 'mixed-mode' };

export class Install extends SfCommand<PackageInstallRequest> {
  public static readonly summary = messages.getMessage('cliDescription');
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    wait: Flags.duration({
      unit: 'minutes',
      char: 'w',
      summary: messages.getMessage('wait'),
      description: messages.getMessage('waitLong'),
      defaultValue: 0,
    }),
    installationkey: Flags.string({
      char: 'k',
      summary: messages.getMessage('installationKey'),
      description: messages.getMessage('installationKeyLong'),
    }),
    publishwait: Flags.duration({
      unit: 'minutes',
      char: 'b',
      summary: messages.getMessage('publishWait'),
      description: messages.getMessage('publishWaitLong'),
      defaultValue: 0,
    }),
    noprompt: Flags.boolean({
      char: 'r',
      summary: messages.getMessage('noPrompt'),
      description: messages.getMessage('noPromptLong'),
    }),
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('package'),
      description: messages.getMessage('packageLong'),
      required: true,
    }),
    apexcompile: Flags.enum({
      char: 'a',
      summary: messages.getMessage('apexCompile'),
      description: messages.getMessage('apexCompileLong'),
      default: 'all',
      options: ['all', 'package'],
    }),
    securitytype: Flags.enum({
      char: 's',
      summary: messages.getMessage('securityType'),
      description: messages.getMessage('securityTypeLong'),
      default: 'AdminsOnly',
      options: ['AllUsers', 'AdminsOnly'],
    }),
    upgradetype: Flags.enum({
      char: 't',
      summary: messages.getMessage('upgradeType'),
      description: messages.getMessage('upgradeTypeLong'),
      default: 'Mixed',
      options: ['DeprecateOnly', 'Mixed', 'Delete'],
    }),
  };

  private connection: Connection;
  private subscriberPackageVersion: SubscriberPackageVersion;

  public static parseStatus(
    request: PackageInstallRequest,
    command: Install | Report,
    installMsgs: Messages<string>,
    username: string,
    alias?: string
  ): void {
    const pkgIdOrAlias = alias ?? request.SubscriberPackageVersionKey;
    const { Status } = request;
    if (Status === 'SUCCESS') {
      command.log(installMsgs.getMessage('packageInstallSuccess', [pkgIdOrAlias]));
    } else if (['IN_PROGRESS', 'UNKNOWN'].includes(Status)) {
      command.log(installMsgs.getMessage('packageInstallInProgress', [request.Id, username]));
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
    const { flags } = await this.parse(Install);
    const noPrompt = flags.noprompt;
    this.connection = flags['target-org'].getConnection(flags['api-version']);

    const apiVersion = parseInt(this.connection.getApiVersion(), 10);
    if (apiVersion < 36) {
      throw messages.createError('apiVersionTooLow');
    }

    this.subscriberPackageVersion = new SubscriberPackageVersion({
      connection: this.connection,
      aliasOrId: flags.package,
      password: flags.installationkey,
    });

    const request: PackageInstallCreateRequest = {
      SubscriberPackageVersionKey: await this.subscriberPackageVersion.getId(),
      Password: flags.installationkey,
      ApexCompileType: flags.apexcompile as PackageInstallCreateRequest['ApexCompileType'],
      SecurityType: securityType[flags.securitytype] as PackageInstallCreateRequest['SecurityType'],
      UpgradeType: upgradeType[flags.upgradetype] as PackageInstallCreateRequest['UpgradeType'],
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    Lifecycle.getInstance().on(PackageEvents.install.warning, async (warningMsg: string) => {
      this.log(warningMsg);
    });

    // If the user has specified --upgradetype Delete, then prompt for confirmation
    // unless the noprompt option has been included.
    if (flags.upgradetype === 'Delete') {
      await this.confirmUpgradeType(noPrompt);
    }

    // If the package has external sites, ask the user for permission to enable them
    // unless the noprompt option has been included.
    await this.confirmExternalSites(request, noPrompt);

    let installOptions: Optional<PackageInstallOptions>;
    if (flags.wait) {
      installOptions = {
        publishTimeout: flags.publishwait,
        pollingTimeout: flags.wait,
      };
      let remainingTime = flags.wait;
      let timeThen = Date.now();
      this.spinner.start(messages.getMessage('packageInstallWaiting', [remainingTime.minutes]));

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
          this.spinner.status = messages.getMessage('packagePublishWaitingStatus', [remainingTime.minutes, status]);
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
          this.spinner.status = messages.getMessage('packageInstallWaitingStatus', [
            remainingTime.minutes,
            piRequest.Status,
          ]);
        }
      );
    }

    const pkgInstallRequest = await this.subscriberPackageVersion.install(request, installOptions);
    this.spinner.stop();
    Install.parseStatus(pkgInstallRequest, this, messages, flags['target-org'].getUsername() as string, flags.package);

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
      if (!(await this.confirm(promptMsg))) {
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
        enableRss = await this.confirm(promptMsg);
      }
      if (enableRss) {
        request.EnableRss = enableRss;
      }
    }
  }
}
