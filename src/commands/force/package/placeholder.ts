/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';

export class Placeholder extends SfdxCommand {
  public static readonly description = 'placeholder';
  public async run(): Promise<AnyJson> {
    return Promise.resolve({});
  }
}
