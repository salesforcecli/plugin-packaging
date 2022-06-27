/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Duration } from '@salesforce/kit';
import { Messages, SfdxPropertyKeys } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create');

export class PackageVersionCreateCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly longDescription = messages.getMessage('cliLongDescription');
  public static readonly help = messages.getMessage('help');
  public static readonly orgType = SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME;
  public static readonly requiresDevhubUsername = true;
  public static readonly requiresProject = true;
  public static readonly flagsConfig: FlagsConfig = {
    package: flags.string({
      char: 'p',
      description: messages.getMessage('package'),
      longDescription: messages.getMessage('longPackage', []),
    }),
    path: flags.directory({
      char: 'd',
      description: messages.getMessage('path'),
      longDescription: messages.getMessage('longPath'),
    }),
    definitionfile: flags.filepath({
      char: 'f',
      description: messages.getMessage('definitionfile'),
      longDescription: messages.getMessage('longDefinitionfile'),
    }),
    branch: flags.string({
      char: 'b',
      description: messages.getMessage('branch'),
      longDescription: messages.getMessage('longBranch'),
    }),
    tag: flags.string({
      char: 't',
      description: messages.getMessage('tag'),
      longDescription: messages.getMessage('longTag'),
    }),
    installationkey: flags.string({
      char: 'k',
      description: messages.getMessage('key'),
      longDescription: messages.getMessage('longKey'),
    }),
    installationkeybypass: flags.boolean({
      char: 'x',
      description: messages.getMessage('keyBypass'),
      longDescription: messages.getMessage('longKeyBypass'),
    }),
    preserve: flags.boolean({
      char: 'r',
      description: messages.getMessage('preserve'),
      longDescription: messages.getMessage('longPreserve'),
      hidden: true,
    }),
    validateschema: flags.boolean({
      char: 'j',
      description: messages.getMessage('validateschema'),
      longDescription: messages.getMessage('longValidateschema'),
      hidden: true,
    }),
    wait: flags.minutes({
      char: 'w',
      description: messages.getMessage('wait'),
      longDescription: messages.getMessage('longWait'),
      default: Duration.minutes(0),
    }),
    buildinstance: flags.string({
      char: 's',
      description: messages.getMessage('instance'),
      longDescription: messages.getMessage('longInstance'),
      hidden: true,
    }),
    versionname: flags.string({
      char: 'a',
      description: messages.getMessage('versionname'),
      longDescription: messages.getMessage('longVersionname'),
    }),
    versionnumber: flags.string({
      char: 'n',
      description: messages.getMessage('versionnumber'),
      longDescription: messages.getMessage('longVersionnumber'),
    }),
    versiondescription: flags.string({
      char: 'e',
      description: messages.getMessage('versiondescription'),
      longDescription: messages.getMessage('longVersiondescription'),
    }),
    codecoverage: flags.boolean({
      char: 'c',
      description: messages.getMessage('codeCoverage'),
      longDescription: messages.getMessage('longCodeCoverage'),
      default: false,
    }),
    releasenotesurl: flags.url({
      description: messages.getMessage('releaseNotesUrl'),
      longDescription: messages.getMessage('releaseNotesUrlLong'),
    }),
    postinstallurl: flags.url({
      description: messages.getMessage('postInstallUrl'),
      longDescription: messages.getMessage('postInstallUrlLong'),
    }),
    postinstallscript: flags.string({
      description: messages.getMessage('postInstallScript'),
      longDescription: messages.getMessage('postInstallScriptLong'),
    }),
    uninstallscript: flags.string({
      description: messages.getMessage('uninstallScript'),
      longDescription: messages.getMessage('uninstallScriptLong'),
    }),
    skipvalidation: flags.boolean({
      description: messages.getMessage('skipValidation'),
      longDescription: messages.getMessage('skipValidationLong'),
      default: false,
    }),
    skipancestorcheck: flags.boolean({
      description: messages.getMessage('skipAncestorCheck'),
      longDescription: messages.getMessage('skipAncestorCheckLong'),
      default: false,
    }),
  };

  public async run(): Promise<unknown> {
    process.exitCode = 1;
    return Promise.resolve('Not yet implemented');
  }
}
