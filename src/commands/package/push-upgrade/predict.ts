/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags, SfCommand, orgApiVersionFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import {
  predictPackageUpgradeRunTime,
  predictPackageUpgradeRunTimeLower,
  predictPackageUpgradeRunTimeUpper,
} from '@salesforce/packaging';

type PackagePushPredictResult = {
  avgTime: string;
  lowerTime: string;
  upperTime: string;
};

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_pushupgrade_predict');

export class PackagePushPredictCommand extends SfCommand<PackagePushPredictResult> {
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    'target-dev-hub': Flags.requiredHub({
      char: 'v',
      summary: messages.getMessage('flags.target-dev-hub.summary'),
      description: messages.getMessage('flags.target-dev-hub.description'),
      required: true,
    }),
    'api-version': orgApiVersionFlagWithDeprecations,
    package: Flags.salesforceId({
      char: 'p',
      length: 'both',
      startsWith: '04t',
      summary: messages.getMessage('flags.package.summary'),
      required: true,
    }),
  };

  public async run(): Promise<PackagePushPredictResult> {
    const { flags } = await this.parse(PackagePushPredictCommand);

    try {
      const conn = flags['target-dev-hub'].getConnection(flags['api-version']);

      // Get predictions with error handling
      const runtimeSeconds: number = await this.getPredictionWithErrorHandling(
        () => predictPackageUpgradeRunTime(conn, flags.package),
        'average runtime'
      );

      const lowerBound: number = await this.getPredictionWithErrorHandling(
        () => predictPackageUpgradeRunTimeLower(conn, flags.package),
        'lower bound'
      );

      const upperBound: number = await this.getPredictionWithErrorHandling(
        () => predictPackageUpgradeRunTimeUpper(conn, flags.package),
        'upper bound'
      );

      // Convert to human readable format
      const avgTime = formatDuration(runtimeSeconds);
      const lowerTime = formatDuration(lowerBound);
      const upperTime = formatDuration(upperBound);

      this.log(messages.getMessage('prediction.success', [avgTime, lowerTime, upperTime]));

      return {
        avgTime,
        lowerTime,
        upperTime,
      };
    } catch (error) {
      if (error instanceof SfError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new SfError(
        messages.getMessage('error.prediction-failed'),
        'PredictionFailed',
        [],
        new Error(errorMessage)
      );
    }
  }

  private async getPredictionWithErrorHandling(
    predictionFunction: () => Promise<number>,
    predictionType: string
  ): Promise<number> {
    try {
      return await predictionFunction();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`Warning: Failed to get ${predictionType} prediction: ${errorMessage}`);
      // Return a default value if prediction fails
      return 0;
    }
  }
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) {
    return '0 seconds';
  }
  const totalSeconds = Math.round(seconds);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`);
  }

  if (parts.length === 1) {
    return parts[0];
  } else if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  } else {
    return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
  }
}
