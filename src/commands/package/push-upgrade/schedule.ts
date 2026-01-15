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
import * as fs from 'node:fs/promises';
import { Flags, SfCommand, orgApiVersionFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages, SfError, Logger } from '@salesforce/core';
import { PackagePushScheduleResult, PackagePushUpgrade } from '@salesforce/packaging';

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
