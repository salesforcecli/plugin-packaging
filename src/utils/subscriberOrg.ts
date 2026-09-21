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
import { readFile } from 'node:fs/promises';

export const parseSubscriberOrgList = (subscriberOrgs: string): string[] =>
  subscriberOrgs.split(',').map((subscriberOrg) => subscriberOrg.trim());

export const parseSubscriberOrgFile = async (filePath: string): Promise<string[]> => {
  const contents = await readFile(filePath, 'utf8');
  return contents
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*/, '').trim())
    .filter(Boolean);
};
