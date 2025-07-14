/*
 * Copyright (c) 2025, salesforce.com, inc.
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
import { BundleSObjects, BundleInstallOptions, PackageBundleInstall } from '@salesforce/packaging';
import { Messages, Lifecycle } from '@salesforce/core';
import { camelCaseToTitleCase, Duration } from '@salesforce/kit';
import { requiredHubFlag } from '../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_install');
export type BundleInstall = BundleSObjects.PkgBundleVersionInstallReqResult;

export class PackageBundlesInstall extends SfCommand<BundleSObjects.PkgBundleVersionInstallReqResult> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static readonly flags = {
    loglevel,
    bundle: Flags.string({
      char: 'b',
      summary: messages.getMessage('flags.bundle.summary'),
      required: true,
    }),
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    'target-dev-hub': requiredHubFlag,
    wait: Flags.integer({
      char: 'w',
      summary: messages.getMessage('flags.wait.summary'),
      default: 0,
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  public async run(): Promise<BundleSObjects.PkgBundleVersionInstallReqResult> {
    const { flags } = await this.parse(PackageBundlesInstall);

    // Get the target org connection
    const targetOrg = flags['target-org'];
    const targetDevHub = flags['target-dev-hub'];
    const connection = targetOrg.getConnection(flags['api-version']);

    const options: BundleInstallOptions = {
      connection,
      project: this.project!,
      PackageBundleVersion: flags.bundle,
      DevelopmentOrganization: targetDevHub.getOrgId() ?? '',
    };

    // Set up lifecycle events for progress tracking
    Lifecycle.getInstance().on(
      'bundle-install-progress',
      // no async methods
      // eslint-disable-next-line @typescript-eslint/require-await
      async (data: BundleSObjects.PkgBundleVersionInstallReqResult & { remainingWaitTime: Duration }) => {
        if (
          data.InstallStatus !== BundleSObjects.PkgBundleVersionInstallReqStatus.success &&
          data.InstallStatus !== BundleSObjects.PkgBundleVersionInstallReqStatus.error
        ) {
          const status = messages.getMessage('bundleInstallWaitingStatus', [
            data.remainingWaitTime.minutes,
            data.InstallStatus,
          ]);
          if (flags.verbose) {
            this.log(status);
          } else {
            this.spinner.status = status;
          }
        }
      }
    );

    const result = await PackageBundleInstall.installBundle(connection, this.project!, {
      ...options,
      polling: {
        timeout: Duration.minutes(flags.wait),
        frequency: Duration.seconds(5),
      },
    });

    const finalStatusMsg = messages.getMessage('bundleInstallFinalStatus', [result.InstallStatus]);
    if (flags.verbose) {
      this.log(finalStatusMsg);
    } else {
      this.spinner.stop(finalStatusMsg);
    }

    switch (result.InstallStatus) {
      case BundleSObjects.PkgBundleVersionInstallReqStatus.error:
        throw messages.createError('bundleInstallError', [result.ValidationError || 'Unknown error']);
      case BundleSObjects.PkgBundleVersionInstallReqStatus.success:
        this.log(messages.getMessage('bundleInstallSuccess', [result.Id]));
        break;
      default:
        this.log(
          messages.getMessage('bundleInstallInProgress', [
            camelCaseToTitleCase(result.InstallStatus as string),
            result.Id,
            targetOrg.getUsername() ?? '',
          ])
        );
    }

    return result;
  }
}
