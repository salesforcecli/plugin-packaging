/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'node:fs/promises';
import { Flags, SfCommand, orgApiVersionFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages, SfError, Logger } from '@salesforce/core';
import { PackagePushScheduleResult, PackagePushUpgrade } from '@salesforce/packaging';
import {
  predictPackageUpgradeRunTime,
  predictPackageUpgradeRunTimeLower,
  predictPackageUpgradeRunTimeUpper,
} from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_pushupgrade_schedule');

export class PackagePushScheduleCommand extends SfCommand<PackagePushScheduleResult> {
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
    'start-time': Flags.string({
      char: 't',
      summary: messages.getMessage('flags.start-time.summary'),
      description: messages.getMessage('flags.start-time.description'),
    }),
    'org-list': Flags.string({
      char: 'l',
      summary: messages.getMessage('flags.org-list.summary'),
      exclusive: ['org-file'],
    }),
    'org-file': Flags.file({
      char: 'f',
      summary: messages.getMessage('flags.org-file.summary'),
      description: messages.getMessage('flags.org-file.description'),
      exists: true,
      exclusive: ['org-list'],
    }),
    'migrate-to-2gp': Flags.boolean({
      summary: messages.getMessage('flags.migrate-to-2gp.summary'),
    }),
  };

  public async run(): Promise<PackagePushScheduleResult> {
    const { flags } = await this.parse(PackagePushScheduleCommand);
    const logger = await Logger.child(this.constructor.name);
    let orgList: string[] = [];

    if (flags['org-file']) {
      logger.debug(`Reading org list from file: ${flags['org-file']}`);
      orgList = await readOrgFile(flags['org-file']);
    } else if (flags['org-list']) {
      logger.debug('Using org list from input flag.');
      orgList = getOrgListFromInput(flags['org-list']);
    } else {
      throw new SfError(messages.getMessage('error.no-org-file-or-org-list-input'));
    }

    const conn = flags['target-dev-hub'].getConnection(flags['api-version']);

    const startTime = flags['start-time'];
    const isMigration = flags['migrate-to-2gp'];

    const result: PackagePushScheduleResult = await PackagePushUpgrade.schedule(
      conn,
      flags.package,
      startTime,
      orgList,
      isMigration
    );

    this.log(messages.getMessage('output', [result?.PushRequestId, orgList.join(', ')]));

    try {
      const runtimeSeconds: number = await predictPackageUpgradeRunTime(conn, flags.package);
      const lowerBound: number = await predictPackageUpgradeRunTimeLower(conn, flags.package);
      const upperBound: number = await predictPackageUpgradeRunTimeUpper(conn, flags.package);

      // Convert to human readable format
      const avgTime = formatDuration(runtimeSeconds);
      const lowerTime = formatDuration(lowerBound);
      const upperTime = formatDuration(upperBound);

      this.log(messages.getMessage('prediction.success', [avgTime, lowerTime, upperTime]));
    } catch (error) {
      this.log(messages.getMessage('prediction.failure'));
    }

    return result;
  }
}

async function readOrgFile(filePath: string): Promise<string[]> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const orgIds = fileContent.split(/\r?\n/).filter((id) => id.trim().length > 0);

    return orgIds.filter((id: string) => /^00D[a-zA-Z0-9]{12}$/.test(id));
  } catch (error) {
    throw new SfError(messages.getMessage('error.invalid-org-file'));
  }
}

function getOrgListFromInput(orgInput: string): string[] {
  try {
    if (orgInput.length === 0) {
      throw new SfError(messages.getMessage('error.empty-org-input'));
    }

    const orgList = orgInput.split(',').map((org) => org.trim());

    return orgList.filter((org) => org.length > 0);
  } catch (error) {
    throw new SfError(messages.getMessage('error.invalid-org-input'));
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
