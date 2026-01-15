/*
 * Copyright 2026, Salesforce, Inc.
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
import { BundleSObjects, BundleInstallOptions, PackageBundleInstall } from '@salesforce/packaging';
import { Messages, Lifecycle } from '@salesforce/core';
import { camelCaseToTitleCase, Duration } from '@salesforce/kit';

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
    'dev-hub-org': Flags.salesforceId({
      length: 'both',
      char: 'd',
      summary: messages.getMessage('flags.dev-hub-org.summary'),
      description: messages.getMessage('flags.dev-hub-org.description'),
      startsWith: '00D',
      required: true,
    }),
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
    const connection = targetOrg.getConnection(flags['api-version']);

    const options: BundleInstallOptions = {
      connection,
      project: this.project!,
      PackageBundleVersion: flags.bundle,
      DevelopmentOrganization: flags['dev-hub-org'],
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

    // Start spinner if polling is enabled and not in verbose mode
    const isSpinnerRunning = flags.wait && flags.wait > 0 && !flags.verbose;
    if (isSpinnerRunning) {
      this.spinner.start('Installing bundle...');
    }

    let result: BundleSObjects.PkgBundleVersionInstallReqResult;
    try {
      result = await PackageBundleInstall.installBundle(connection, this.project!, {
        ...options,
        ...(flags.wait && flags.wait > 0
          ? { polling: { timeout: Duration.minutes(flags.wait), frequency: Duration.seconds(5) } }
          : undefined),
      });
    } catch (error) {
      // Stop spinner on error
      if (isSpinnerRunning) {
        this.spinner.stop();
      }
      throw error;
    }

    // Stop spinner only if it was started - stop it cleanly without a message
    if (isSpinnerRunning) {
      this.spinner.stop();
    }

    switch (result.InstallStatus) {
      case BundleSObjects.PkgBundleVersionInstallReqStatus.error: {
        const errorText =
          result.ValidationError ||
          `Bundle installation failed. Run 'sf package bundle install report -i ${result.Id} -o ${
            targetOrg.getUsername() ?? 'targetOrg'
          }' for more details.`;
        throw messages.createError('bundleInstallError', [errorText]);
      }
      case BundleSObjects.PkgBundleVersionInstallReqStatus.success: {
        const bundleVersionId = result.PackageBundleVersionId || flags.bundle;
        this.log(
          `Successfully installed bundle version ${bundleVersionId} to ${targetOrg.getUsername() ?? 'target org'}`
        );
        break;
      }
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
