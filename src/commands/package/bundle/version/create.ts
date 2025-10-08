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

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import {
  BundleVersionCreateOptions,
  BundleSObjects,
  PackageBundleVersion,
  BundleVersionEvents,
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
    'version-number': Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.version-number.summary'),
    }),
  };

  public async run(): Promise<BundleSObjects.PackageBundleVersionCreateRequestResult> {
    const { flags } = await this.parse(PackageBundlesCreate);

    // Parse version number if provided
    let majorVersion = '';
    let minorVersion = '';
    if (flags['version-number']) {
      const versionParts = flags['version-number'].split('.');
      majorVersion = versionParts[0] || '';
      minorVersion = versionParts[1] || '';
    }

    const options: BundleVersionCreateOptions = {
      connection: flags['target-dev-hub'].getConnection(flags['api-version']),
      project: this.project!,
      PackageBundle: flags.bundle,
      BundleVersionComponentsPath: flags['definition-file'],
      Description: flags.description,
      MajorVersion: majorVersion,
      MinorVersion: minorVersion,
      Ancestor: '',
    };
    Lifecycle.getInstance().on(
      BundleVersionEvents.create.progress,
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
      ...(flags.wait && flags.wait > 0
        ? { polling: { timeout: Duration.minutes(flags.wait), frequency: Duration.seconds(5) } }
        : undefined),
    });
    const finalStatusMsg = messages.getMessage('bundleVersionCreateFinalStatus', [result.RequestStatus]);
    if (flags.verbose) {
      this.log(finalStatusMsg);
    } else {
      this.spinner.stop(finalStatusMsg);
    }

    switch (result.RequestStatus) {
      case BundleSObjects.PkgBundleVersionCreateReqStatus.error: {
        let errorDetails = 'No specific error details available';
        const errors = [];
        
        if (result.Error?.length) {
          errors.push(...result.Error);
        }
        
        if (result.ValidationError) {
          errors.push(result.ValidationError);
        }
        
        if (errors.length > 0) {
          errorDetails = errors.join('\n');
        }
        
        throw messages.createError('multipleErrors', [errorDetails]);
      }
      case BundleSObjects.PkgBundleVersionCreateReqStatus.success:
        this.log(`Successfully created bundle version ${result.PackageBundleVersionId}`);
        break;
      default:
        this.log(messages.getMessage('InProgress', [camelCaseToTitleCase(result.RequestStatus as string), result.Id]));
    }
    return result;
  }
}
