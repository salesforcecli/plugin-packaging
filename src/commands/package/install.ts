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
import { Connection, Lifecycle, Messages, SfError } from '@salesforce/core';
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

export type PackageInstallRequest = PackagingSObjects.PackageInstallRequest;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install');

// maps of command flag values to PackageInstallRequest values
const securityType = { AllUsers: 'full', AdminsOnly: 'none' };
const upgradeType = { Delete: 'delete-only', DeprecateOnly: 'deprecate-only', Mixed: 'mixed-mode' };

export class Install extends SfCommand<PackageInstallRequest> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:package:beta:install', 'force:package:install'];
  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    wait: Flags.duration({
      unit: 'minutes',
      char: 'w',
      summary: messages.getMessage('flags.wait.summary'),
      default: Duration.minutes(0),
    }),
    'installation-key': Flags.string({
      char: 'k',
      deprecateAliases: true,
      aliases: ['installationkey'],
      summary: messages.getMessage('flags.installation-key.summary'),
    }),
    'publish-wait': Flags.duration({
      unit: 'minutes',
      char: 'b',
      deprecateAliases: true,
      aliases: ['publishwait'],
      summary: messages.getMessage('flags.publish-wait.summary'),
      default: Duration.minutes(0),
    }),
    'no-prompt': Flags.boolean({
      char: 'r',
      deprecateAliases: true,
      aliases: ['noprompt'],
      summary: messages.getMessage('flags.no-prompt.summary'),
      description: messages.getMessage('flags.no-prompt.description'),
    }),
    package: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.package.summary'),
      required: true,
    }),
    'apex-compile': Flags.enum({
      char: 'a',
      deprecateAliases: true,
      aliases: ['apexcompile'],
      summary: messages.getMessage('flags.apex-compile.summary'),
      description: messages.getMessage('flags.apex-compile.description'),
      default: 'all',
      options: ['all', 'package'],
    }),
    'security-type': Flags.enum({
      char: 's',
      deprecateAliases: true,
      aliases: ['securitytype'],
      summary: messages.getMessage('flags.security-type.summary'),
      default: 'AdminsOnly',
      options: ['AllUsers', 'AdminsOnly'],
    }),
    'upgrade-type': Flags.enum({
      char: 't',
      deprecateAliases: true,
      aliases: ['upgradetype'],
      summary: messages.getMessage('flags.upgrade-type.summary'),
      description: messages.getMessage('flags.upgrade-type.description'),
      default: 'Mixed',
      options: ['DeprecateOnly', 'Mixed', 'Delete'],
    }),
  };

  private connection: Connection;
  private subscriberPackageVersion: SubscriberPackageVersion;

  public async run(): Promise<PackageInstallRequest> {
    const { flags } = await this.parse(Install);
    const noPrompt = flags['no-prompt'];
    this.connection = flags['target-org'].getConnection(flags['api-version']);

    const apiVersion = parseInt(this.connection.getApiVersion(), 10);
    if (apiVersion < 36) {
      throw messages.createError('apiVersionTooLow');
    }

    this.subscriberPackageVersion = new SubscriberPackageVersion({
      connection: this.connection,
      aliasOrId: flags.package,
      password: flags['installation-key'],
    });

    const request: PackageInstallCreateRequest = {
      SubscriberPackageVersionKey: await this.subscriberPackageVersion.getId(),
      Password: flags['installation-key'],
      ApexCompileType: flags['apex-compile'] as PackageInstallCreateRequest['ApexCompileType'],
      SecurityType: securityType[flags['security-type']] as PackageInstallCreateRequest['SecurityType'],
      UpgradeType: upgradeType[flags['upgrade-type']] as PackageInstallCreateRequest['UpgradeType'],
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    Lifecycle.getInstance().on(PackageEvents.install.warning, async (warningMsg: string) => {
      this.warn(warningMsg);
    });

    // If the user has specified --upgradetype Delete, then prompt for confirmation
    // unless the noprompt option has been included.
    if (flags['upgrade-type'] === 'Delete') {
      await this.confirmUpgradeType(noPrompt);
    }

    // If the package has external sites, ask the user for permission to enable them
    // unless the noprompt option has been included.
    await this.confirmExternalSites(request, noPrompt);

    let installOptions: Optional<PackageInstallOptions>;
    if (flags.wait) {
      installOptions = {
        publishTimeout: flags['publish-wait'],
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

    let pkgInstallRequest: Optional<PackageInstallRequest>;
    try {
      pkgInstallRequest = await this.subscriberPackageVersion.install(request, installOptions);
      this.spinner.stop();
    } catch (error: unknown) {
      if (error instanceof SfError && error.data) {
        pkgInstallRequest = error.data as PackageInstallRequest;
        this.spinner.stop(messages.getMessage('packageInstallPollingTimeout'));
      } else {
        throw error;
      }
    } finally {
      if (pkgInstallRequest) {
        this.log(
          Report.parseStatus(
            this.config.bin,
            pkgInstallRequest,
            flags['target-org'].getUsername() as string,
            flags.package as Optional<string>
          )
        );
      }
    }

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
      const promptMsg = messages.getMessage('prompt-upgrade-type');
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
