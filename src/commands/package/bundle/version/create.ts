/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import {
  BundleVersionCreateOptions,
  PackageVersionEvents,
  BundleSObjects,
  PackageBundleVersion,
} from '@salesforce/packaging';
import { Messages, Lifecycle } from '@salesforce/core';
import { camelCaseToTitleCase, Duration } from '@salesforce/kit';
import { requiredHubFlag } from '../../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
// TODO: Update messages
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_version_create');
export type BundleVersionCreate = BundleSObjects.PackageBundleVersionCreateRequestResult;

export class PackageBundlesCreate extends SfCommand<BundleSObjects.PackageBundleVersionCreateRequestResult> {
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
    description: Flags.string({
      char: 'd',
      summary: messages.getMessage('flags.description.summary'),
    }),
    'definition-file': Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.definition-file.summary'),
      required: true,
    }),
    'target-dev-hub': requiredHubFlag,
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

  public async run(): Promise<BundleSObjects.PackageBundleVersionCreateRequestResult> {
    const { flags } = await this.parse(PackageBundlesCreate);
    const options: BundleVersionCreateOptions = {
      connection: flags['target-dev-hub'].getConnection(flags['api-version']),
      project: this.project!,
      PackageBundle: flags.bundle,
      BundleVersionComponentsPath: flags['definition-file'],
      Description: flags.description,
      MajorVersion: '',
      MinorVersion: '',
      Ancestor: '',
    };
    Lifecycle.getInstance().on(
      PackageVersionEvents.create.progress,
      // no async methods
      // eslint-disable-next-line @typescript-eslint/require-await
      async (data: BundleSObjects.PackageBundleVersionCreateRequestResult & { remainingWaitTime: Duration }) => {
        if (
          data.RequestStatus !== BundleSObjects.PkgBundleVersionCreateReqStatus.success &&
          data.RequestStatus !== BundleSObjects.PkgBundleVersionCreateReqStatus.error
        ) {
          const status = messages.getMessage('bundleVersionCreateWaitingStatus', [
            data.remainingWaitTime.minutes,
            data.RequestStatus,
          ]);
          if (flags.verbose) {
            this.log(status);
          } else {
            this.spinner.status = status;
          }
        }
      }
    );

    const result = await PackageBundleVersion.create({
      ...options,
      polling: {
        timeout: Duration.minutes(flags.wait),
        frequency: Duration.seconds(5),
      },
    });
    const finalStatusMsg = messages.getMessage('bundleVersionCreateFinalStatus', [result.RequestStatus]);
    if (flags.verbose) {
      this.log(finalStatusMsg);
    } else {
      this.spinner.stop(finalStatusMsg);
    }

    switch (result.RequestStatus) {
      case BundleSObjects.PkgBundleVersionCreateReqStatus.error:
        throw messages.createError('multipleErrors', ['Unknown error']);
      case BundleSObjects.PkgBundleVersionCreateReqStatus.success:
        this.log(messages.getMessage('bundleVersionCreateSuccess', [result.Id]));
        break;
      default:
        this.log(messages.getMessage('InProgress', [camelCaseToTitleCase(result.RequestStatus as string), result.Id]));
    }
    return result;
  }
}
