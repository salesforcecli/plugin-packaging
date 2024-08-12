/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfProject } from '@salesforce/core';

/*
 * Get the sfdx project from the current dir.
 * It will return `undefined` if there's no project.
 * */
export async function maybeGetProject(): Promise<SfProject | undefined> {
  try {
    return await SfProject.resolve();
  } catch (err) {
    if (err instanceof Error && err.name === 'InvalidProjectWorkspaceError') {
      return undefined;
    }
  }
}
