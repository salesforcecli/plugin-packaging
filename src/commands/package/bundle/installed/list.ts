/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, orgApiVersionFlagWithDeprecations, requiredOrgFlagWithDeprecations, SfCommand } from '@salesforce/sf-plugins-core';
import { Connection, Messages } from '@salesforce/core';
import { BundleSObjects, PackageBundleInstall, getInstalledBundleStatuses, InstalledBundleStatus } from '@salesforce/packaging';
import chalk from 'chalk';
import { requiredHubFlag } from '../../../../utils/hubFlag.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'bundle_installed_list');

export type BundleInstalledListResults = InstalledBundleStatus[];

export class PackageBundleInstalledListCommand extends SfCommand<BundleInstalledListResults> {
  public static readonly hidden = true;
  public static state = 'beta';
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'target-dev-hub': requiredHubFlag,
    'api-version': orgApiVersionFlagWithDeprecations,
    bundles: Flags.string({
      char: 'b',
      multiple: true,
      summary: messages.getMessage('flags.bundles.summary'),
      description: messages.getMessage('flags.bundles.description'),
    }),
    verbose: Flags.boolean({ summary: messages.getMessage('flags.verbose.summary') }),
  } as const;

  private subscriberConn!: Connection;
  private devHubConn!: Connection;

  public async run(): Promise<BundleInstalledListResults> {
    const { flags } = await this.parse(PackageBundleInstalledListCommand);

    this.subscriberConn = flags['target-org'].getConnection(flags['api-version']);
    this.devHubConn = flags['target-dev-hub'].getConnection(flags['api-version']);

    let bundleVersionIds = flags.bundles ?? [];
    if (bundleVersionIds.length === 0) {
      // Preferred: try InstalledPackageBundleVersion if available in subscriber org
      try {
        const query =
          'SELECT Id, PackageBundleVersion.Id FROM InstalledPackageBundleVersion ORDER BY CreatedDate DESC';
        const ipbv = await this.subscriberConn.tooling.query<{ Id: string; PackageBundleVersion?: { Id: string } }>(
          query
        );
        const ids = new Set<string>();
        for (const r of ipbv.records) {
          const id = r.PackageBundleVersion?.Id;
          if (id) ids.add(id);
        }
        bundleVersionIds = [...ids];
      } catch {
        // Fallback: derive from successful install requests
        const successes = await PackageBundleInstall.getInstallStatuses(
          this.subscriberConn,
          BundleSObjects.PkgBundleVersionInstallReqStatus.success
        );
        const ids = new Set<string>();
        for (const r of successes) {
          if (r.PackageBundleVersionID) ids.add(r.PackageBundleVersionID);
        }
        bundleVersionIds = [...ids];
      }
    }
    const results = await getInstalledBundleStatuses(this.subscriberConn, this.devHubConn, bundleVersionIds);

    if (results.length === 0) {
      this.log(messages.getMessage('noBundles'));
      return [];
    }

    this.displayResults(results, flags.verbose);
    return results;
  }

  private displayResults(results: BundleInstalledListResults, verbose = false): void {
    for (const r of results) {
      this.styledHeader(chalk.blue(`${r.bundleName} (${r.bundleVersionNumber}) [${r.status}]`));
      const componentRows = r.components.map((c: InstalledBundleStatus['components'][number]) => ({
        Package: c.packageName,
        'Expected Version': c.expectedVersionNumber,
        'Actual Version': c.actualVersionNumber ?? 'Not Installed',
        Status: c.status,
      }));
      this.table({ data: componentRows, overflow: 'wrap', title: chalk.gray(`Bundle ID ${r.bundleId}`) });
      if (verbose) this.log('');
    }
  }
}


