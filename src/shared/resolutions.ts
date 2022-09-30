/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Package } from '@salesforce/packaging';
import { Messages, SfProject } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-packaging', 'packaging', [
  'projectNotFound',
  'packageAliasNotFound',
]);

export const resolveSubscriberPackageVersionKey = (idOrAlias: string): string => {
  let resolvedId: string;

  if (idOrAlias.startsWith('04t')) {
    Package.validateId(idOrAlias, 'SubscriberPackageVersionId');
    resolvedId = idOrAlias;
  } else {
    let packageAliases: { [k: string]: string };
    try {
      const projectJson = SfProject.getInstance().getSfProjectJson();
      packageAliases = projectJson.getContents().packageAliases ?? {};
    } catch (e) {
      throw messages.createError('projectNotFound', [idOrAlias]);
    }
    resolvedId = packageAliases[idOrAlias];
    if (!resolvedId) {
      throw messages.createError('packageAliasNotFound', [idOrAlias]);
    }
    Package.validateId(resolvedId, 'SubscriberPackageVersionId');
  }

  return resolvedId;
};
