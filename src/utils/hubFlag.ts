/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags } from '@salesforce/sf-plugins-core';

/**
 * @deprecated
 */
export const requiredHubFlag = Flags.requiredHub({
  aliases: ['targetdevhubusername', 'target-hub-org'],
  deprecateAliases: true,
  required: true,
});
