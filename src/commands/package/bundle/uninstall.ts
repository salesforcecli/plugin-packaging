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
import { Lifecycle, Messages } from '@salesforce/core';
import { BundleSObjects, PackageBundleUninstall } from '@salesforce/packaging';
import { camelCaseToTitleCase, Duration } from '@salesforce/kit';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_uninstall');

export type BundleUninstallResult = BundleSObjects.PkgBundleVerUninstallReqResult;

export class PackageBundleUninstallCommand extends SfCommand<BundleUninstallResult> {
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
    wait: Flags.integer({
      char: 'w',
      summary: messages.getMessage('flags.wait.summary'),
      default: 0,
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  public async run(): Promise<BundleUninstallResult> {
    const { flags } = await this.parse(PackageBundleUninstallCommand);

    const targetOrg = flags['target-org'];
    const connection = targetOrg.getConnection(flags['api-version']);

    // Set up lifecycle events for progress tracking
    Lifecycle.getInstance().on(
      'bundle-uninstall-progress',
      // no async methods
      // eslint-disable-next-line @typescript-eslint/require-await
      async (data: BundleSObjects.PkgBundleVerUninstallReqResult & { remainingWaitTime: Duration }) => {
        if (
          data.UninstallStatus !== BundleSObjects.PkgBundleVersionUninstallReqStatus.success &&
          data.UninstallStatus !== BundleSObjects.PkgBundleVersionUninstallReqStatus.error
        ) {
          const status = messages.getMessage('bundleUninstallWaitingStatus', [
            data.remainingWaitTime.minutes,
            data.UninstallStatus,
          ]);
          if (flags.verbose) {
            this.log(status);
          } else {
            this.spinner.status = status;
          }
        }
      }
    );

    const pollingOptions =
      flags.wait && flags.wait > 0
        ? { polling: { timeout: Duration.minutes(flags.wait), frequency: Duration.seconds(5) } }
        : undefined;

    const isSpinnerRunning = flags.wait && flags.wait > 0 && !flags.verbose;
    if (isSpinnerRunning) {
      this.spinner.start('Uninstalling bundle...');
    }

    let result: BundleSObjects.PkgBundleVerUninstallReqResult;
    try {
      result = await PackageBundleUninstall.uninstallBundle(connection, this.project!, {
        connection,
        project: this.project!,
        PackageBundleVersion: flags.bundle,
        ...pollingOptions,
      });
    } catch (error) {
      if (isSpinnerRunning) {
        this.spinner.stop();
      }
      throw error;
    }

    if (isSpinnerRunning) {
      this.spinner.stop();
    }

    switch (result.UninstallStatus) {
      case BundleSObjects.PkgBundleVersionUninstallReqStatus.error: {
        const errorText =
          result.ValidationError ??
          `Bundle uninstall failed. Request Id: ${result.Id} Target org: ${targetOrg.getUsername() ?? 'target org'}`;
        throw messages.createError('bundleUninstallError', [errorText]);
      }
      case BundleSObjects.PkgBundleVersionUninstallReqStatus.success: {
        const bundleVersionId = result.PackageBundleVersionId ?? flags.bundle;
        this.log(messages.getMessage('bundleUninstallSuccess', [bundleVersionId, targetOrg.getUsername() ?? '']));
        break;
      }
      default:
        this.log(
          messages.getMessage('bundleUninstallInProgress', [
            camelCaseToTitleCase(result.UninstallStatus as string),
            result.Id,
            targetOrg.getUsername() ?? '',
          ])
        );
    }

    return result;
  }
}

