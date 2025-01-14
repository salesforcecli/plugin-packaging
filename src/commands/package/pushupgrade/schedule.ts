/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from 'node:fs/promises';
import * as csv from 'csv-parse/sync';
import { Flags, SfCommand, orgApiVersionFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import { PackagePushScheduleResult, PackagePushUpgrade } from '@salesforce/packaging';
import { requiredHubFlag } from '../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_pushupgrade_schedule');

export class PackagePushScheduleCommand extends SfCommand<PackagePushScheduleResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly aliases = ['force:package:pushupgrade:schedule'];
  public static readonly flags = {
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    'package-version-id': Flags.string({
      char: 'i',
      summary: messages.getMessage('flags.package-version-id.summary'),
      required: true,
    }),
    'scheduled-start-time': Flags.string({
      char: 't',
      deprecateAliases: true,
      aliases: ['scheduledstarttime'],
      summary: messages.getMessage('flags.scheduled-start-time.summary'),
    }),
    'org-list': Flags.file({
      char: 'f',
      summary: messages.getMessage('flags.org-list.summary'),
      required: true,
    }),
  };

  public async run(): Promise<PackagePushScheduleResult> {
    const { flags } = await this.parse(PackagePushScheduleCommand);

    // Validate package version
    if (!isValidPackageVersionId(flags['package-version-id'])) {
      throw new SfError(messages.getMessage('error.invalid-package-version'));
    }

    // Read and validate org list
    const orgList = await readOrgListFile(flags['org-list']);

    // Connect to the Dev Hub
    const conn = flags['target-dev-hub'].getConnection(flags['api-version']);

    // Schedule the push upgrade
    const result = await PackagePushUpgrade.schedule(
      conn,
      flags['package-version-id'],
      flags['scheduled-start-time']!,
      orgList
    );

    return result;
  }
}

function isValidPackageVersionId(id: string): boolean {
  // Implement validation logic for 04t id
  return /^04t[a-zA-Z0-9]{15}$/.test(id);
}

async function readOrgListFile(filePath: string): Promise<string[]> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const records = csv.parse(fileContent, { columns: false, skipEmptyLines: true }) as string[][];

    if (records.length === 0) {
      throw new SfError(messages.getMessage('error.empty-org-list'));
    }

    return records.map((row: string[]) => row[0]).filter((id: string) => /^00D[a-zA-Z0-9]{15}$/.test(id));
  } catch (error) {
    throw new SfError(messages.getMessage('error.invalid-org-list-file'));
  }
}
