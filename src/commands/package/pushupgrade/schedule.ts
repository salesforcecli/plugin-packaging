/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from 'node:fs/promises';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import { PackagePushScheduleResult, PackagePushUpgrade } from '@salesforce/packaging';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_pushupgrade_schedule');

export class PackagePushScheduleCommand extends SfCommand<PackagePushScheduleResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly flags = {
    'target-dev-hub': Flags.requiredHub({
      char: 'v',
      summary: messages.getMessage('flags.target-dev-hub.summary'),
      description: messages.getMessage('flags.target-dev-hub.description'),
      required: true,
    }),
    'api-version': Flags.orgApiVersion(),
    'package-version-id': Flags.salesforceId({
      length: 'both',
      char: 'p',
      summary: messages.getMessage('flags.package-version-id.summary'),
      required: true,
      startsWith: '04t',
    }),
    'scheduled-start-time': Flags.string({
      char: 't',
      summary: messages.getMessage('flags.scheduled-start-time.summary'),
    }),
    'org-list': Flags.file({
      char: 'l',
      summary: messages.getMessage('flags.org-list.summary'),
      required: true,
      exists: true,
    }),
  };

  public async run(): Promise<PackagePushScheduleResult> {
    const { flags } = await this.parse(PackagePushScheduleCommand);

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

    this.log(messages.getMessage('output', [result?.PushRequestId]));

    return result;
  }
}

async function readOrgListFile(filePath: string): Promise<string[]> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const orgIds = fileContent.split(/\r?\n/).filter((id) => id.trim().length > 0);

    return orgIds.filter((id: string) => /^00D[a-zA-Z0-9]{12}$/.test(id));
  } catch (error) {
    throw new SfError(messages.getMessage('error.invalid-org-list-file'), error as string | undefined);
  }
}
