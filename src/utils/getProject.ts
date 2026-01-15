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

import { SfProject } from '@salesforce/core';

/*
 * Get the sfdx project from the current dir.
 * It will return `undefined` if there's no project.
 * */
export async function maybeGetProject(): Promise<SfProject | undefined> {
  try {
    return await SfProject.resolve();
  } catch {
    return undefined;
  }
}
