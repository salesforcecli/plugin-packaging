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
      required: false,
    }),
    path: flags.directory({
      char: 'd',
      description: messages.getMessage('path'),
      longDescription: messages.getMessage('longPath'),
      required: false,
    }),
    definitionfile: flags.filepath({
      char: 'f',
      description: messages.getMessage('definitionfile'),
      longDescription: messages.getMessage('longDefinitionfile'),
      required: false,
    }),
    branch: flags.string({
      char: 'b',
      description: messages.getMessage('branch'),
      longDescription: messages.getMessage('longBranch'),
      required: false,
    }),
    tag: flags.string({
      char: 't',
      description: messages.getMessage('tag'),
      longDescription: messages.getMessage('longTag'),
      required: false,
    }),
    installationkey: flags.string({
      char: 'k',
      description: messages.getMessage('key'),
      longDescription: messages.getMessage('longKey'),
      required: false,
    }),
    installationkeybypass: flags.boolean({
      char: 'x',
      description: messages.getMessage('keyBypass'),
      longDescription: messages.getMessage('longKeyBypass'),
      required: false,
    }),
    preserve: flags.boolean({
      char: 'r',
      description: messages.getMessage('preserve'),
      longDescription: messages.getMessage('longPreserve'),
      required: false,
      hidden: true,
    }),
    validateschema: flags.boolean({
      char: 'j',
      description: messages.getMessage('validateschema'),
      longDescription: messages.getMessage('longValidateschema'),
      required: false,
      hidden: true,
    }),
    wait: flags.minutes({
      char: 'w',
      description: messages.getMessage('wait'),
      longDescription: messages.getMessage('longWait'),
      required: false,
      default: Duration.minutes(0),
    }),
    buildinstance: flags.string({
      char: 's',
      description: messages.getMessage('instance'),
      longDescription: messages.getMessage('longInstance'),
      required: false,
      hidden: true,
    }),
    versionname: flags.string({
      char: 'a',
      description: messages.getMessage('versionname'),
      longDescription: messages.getMessage('longVersionname'),
      required: false,
    }),
    versionnumber: flags.string({
      char: 'n',
      description: messages.getMessage('versionnumber'),
      longDescription: messages.getMessage('longVersionnumber'),
      required: false,
    }),
    versiondescription: flags.string({
      char: 'e',
      description: messages.getMessage('versiondescription'),
      longDescription: messages.getMessage('longVersiondescription'),
      required: false,
    }),
    codecoverage: flags.boolean({
      char: 'c',
      description: messages.getMessage('codeCoverage'),
      longDescription: messages.getMessage('longCodeCoverage'),
      required: false,
      default: false,
    }),
    releasenotesurl: flags.url({
      description: messages.getMessage('releaseNotesUrl'),
      longDescription: messages.getMessage('releaseNotesUrlLong'),
      required: false,
    }),
    postinstallurl: flags.url({
      description: messages.getMessage('postInstallUrl'),
      longDescription: messages.getMessage('postInstallUrlLong'),
      required: false,
    }),
    postinstallscript: flags.string({
      description: messages.getMessage('postInstallScript'),
      longDescription: messages.getMessage('postInstallScriptLong'),
      required: false,
    }),
    uninstallscript: flags.string({
      description: messages.getMessage('uninstallScript'),
      longDescription: messages.getMessage('uninstallScriptLong'),
      required: false,
    }),
    skipvalidation: flags.boolean({
      description: messages.getMessage('skipValidation'),
      longDescription: messages.getMessage('skipValidationLong'),
      required: false,
      default: false,
    }),
    skipancestorcheck: flags.boolean({
      description: messages.getMessage('skipAncestorCheck'),
      longDescription: messages.getMessage('skipAncestorCheckLong'),
      required: false,
      default: false,
    }),
  };

  public async run(): Promise<unknown> {
    process.exitCode = 1;
    return Promise.resolve('Not yet implemented');
  }
}
