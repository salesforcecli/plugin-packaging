/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Messages, SfError, SfProject } from '@salesforce/core';
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'utils');

export function resolveSubscriberPackageVersionId(packageAliasOrId: string): string {
  let pkgId = packageAliasOrId;
  if (!pkgId.startsWith('04t')) {
    try {
      const project = SfProject.getInstance();
      pkgId = project.getPackageIdFromAlias(pkgId) || pkgId;
      if (!pkgId || !pkgId.startsWith('04t')) {
        throw messages.createError('invalidAliasOrId', [packageAliasOrId]);
      }
    } catch (err) {
      const sfError = err as SfError;
      if (sfError.name === 'InvalidProjectWorkspaceError') {
        throw messages.createError('projectNotFound', [packageAliasOrId], []);
      }
      throw err;
    }
  }
  return pkgId;
}
