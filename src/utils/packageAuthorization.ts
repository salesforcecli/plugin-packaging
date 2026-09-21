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
import { Connection, SfError, SfProject, validateSalesforceId } from '@salesforce/core';
import { Package } from '@salesforce/packaging';

export const resolveSubscriberPackageId = async ({
  packageAliasOrId,
  connection,
  project,
}: {
  packageAliasOrId: string;
  connection: Connection;
  project?: SfProject;
}): Promise<string> => {
  const resolvedPackageId = project?.getPackageIdFromAlias(packageAliasOrId) ?? packageAliasOrId;
  if (
    (resolvedPackageId.startsWith('033') || resolvedPackageId.startsWith('0Ho')) &&
    !validateSalesforceId(resolvedPackageId)
  ) {
    throw new SfError(
      `The package ID ${resolvedPackageId} is invalid. It must be a 15- or 18-character Salesforce ID.`
    );
  }
  if (resolvedPackageId.startsWith('033')) {
    return resolvedPackageId;
  }

  const pkg = new Package({ packageAliasOrId, connection, project });
  return pkg.getSubscriberPackageId();
};
