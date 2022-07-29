/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfProject } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { Package, PackagingSObjects, PackageInstallOptions } from '@salesforce/packaging';
import { ensure } from '@salesforce/ts-types';
import PackageInstallRequest = PackagingSObjects.PackageInstallRequest;
import PackageInstallCreateRequest = PackagingSObjects.PackageInstallCreateRequest;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_install');

export class PackageInstallCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly longDescription = messages.getMessage('cliDescriptionLong');
  public static readonly help = messages.getMessage('help');
  public static readonly;
  public static readonly requiresUsername = true;
  public static readonly flagsConfig: FlagsConfig = {
    wait: flags.minutes({
      char: 'w',
      description: messages.getMessage('wait'),
      longDescription: messages.getMessage('waitLong'),
    }),
    installationkey: flags.string({
      char: 'k',
      description: messages.getMessage('installationKey'),
      longDescription: messages.getMessage('installationKeyLong'),
    }),
    publishwait: flags.minutes({
      char: 'b',
      description: messages.getMessage('publishWait'),
      longDescription: messages.getMessage('publishWaitLong'),
    }),
    noprompt: flags.boolean({
      char: 'r',
      description: messages.getMessage('noPrompt'),
      longDescription: messages.getMessage('noPromptLong'),
    }),
    package: flags.string({
      char: 'p',
      description: messages.getMessage('package'),
      longDescription: messages.getMessage('packageLong'),
      required: true,
    }),
    apexcompile: flags.enum({
      char: 'a',
      description: messages.getMessage('apexCompile'),
      longDescription: messages.getMessage('apexCompileLong'),
      default: 'all',
      options: ['all', 'package'],
    }),
    securitytype: flags.enum({
      char: 's',
      description: messages.getMessage('securityType'),
      longDescription: messages.getMessage('securityTypeLong'),
      default: 'AdminsOnly',
      options: ['AllUsers', 'AdminsOnly'],
    }),
    upgradetype: flags.enum({
      char: 't',
      description: messages.getMessage('upgradeType'),
      longDescription: messages.getMessage('upgradeTypeLong'),
      default: 'Mixed',
      options: ['DeprecateOnly', 'Mixed', 'Delete'],
    }),
  };

  public async run(): Promise<PackageInstallRequest> {
    const connection = this.org.getConnection();
    const pkg = new Package({ connection });

    const request: PackageInstallCreateRequest = {
      SubscriberPackageVersionKey: this.resolveSubscriberPackageVersionKey(this.flags.package),
    };

    const installOptions: PackageInstallOptions = {
      pollingTimeout: ensure<Duration>(this.flags.wait),
    };

    return pkg.install(request, installOptions);
  }

  // Given a package version ID (04t) or an alias for the package,
  // return the package version ID (aka SubscriberPackageVersionKey).
  private resolveSubscriberPackageVersionKey(idOrAlias: string): string {
    if (idOrAlias.startsWith('04t')) {
      return idOrAlias;
    } else {
      let packageAliases: { [k: string]: string };
      try {
        const projectJson = SfProject.getInstance().getSfProjectJson();
        packageAliases = projectJson.getContents().packageAliases ?? {};
      } catch (e) {
        // If not within a package, provide that error
      }
      const id = packageAliases[idOrAlias];
      if (!id) {
        // throw NotFound error
      }
      if (!id.startsWith('04t')) {
        // throw InvalidSubscriberPackageVersion - doesn't start with 04t
      }
      if ([15, 18].includes(id.length)) {
        // throw InvalidSubscriberPackageVersion - incorrect length
      }
      return id;
    }
  }
}
