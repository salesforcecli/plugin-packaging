/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Duration } from '@salesforce/kit';
import { Messages, PollingClient, StatusResult } from '@salesforce/core';
import {
  convertCamelCaseStringToSentence,
  getCreatePackageVersionCreateRequestReport,
  getPackageIdFromAlias,
  INSTALL_URL_BASE,
  PackagingSObjects,
} from '@salesforce/packaging';
import { PackageVersionCreate } from '@salesforce/packaging/lib/package/packageVersionCreate';
import { Optional } from '@salesforce/ts-types';
import Package2VersionStatus = PackagingSObjects.Package2VersionStatus;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-packaging', 'package_version_create');

export class PackageVersionCreateCommand extends SfdxCommand {
  public static readonly description = messages.getMessage('cliDescription');
  public static readonly longDescription = messages.getMessage('cliLongDescription');
  public static readonly help = messages.getMessage('help');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly requiresDevhubUsername = true;
  public static readonly requiresProject = true;
  public static readonly flagsConfig: FlagsConfig = {
    branch: flags.string({
      char: 'b',
      description: messages.getMessage('branch'),
      longDescription: messages.getMessage('longBranch'),
    }),
    buildinstance: flags.string({
      char: 's',
      description: messages.getMessage('instance'),
      longDescription: messages.getMessage('longInstance'),
      hidden: true,
    }),
    codecoverage: flags.boolean({
      char: 'c',
      description: messages.getMessage('codeCoverage'),
      longDescription: messages.getMessage('longCodeCoverage'),
      default: false,
      exclusive: ['skipvalidation'],
    }),
    definitionfile: flags.filepath({
      char: 'f',
      description: messages.getMessage('definitionfile'),
      longDescription: messages.getMessage('longDefinitionfile'),
    }),
    installationkey: flags.string({
      char: 'k',
      description: messages.getMessage('key'),
      longDescription: messages.getMessage('longKey'),
      exactlyOne: ['installationkey', 'installationkeybypass'],
    }),
    installationkeybypass: flags.boolean({
      char: 'x',
      description: messages.getMessage('keyBypass'),
      longDescription: messages.getMessage('longKeyBypass'),
      exactlyOne: ['installationkey', 'installationkeybypass'],
    }),
    package: flags.string({
      char: 'p',
      description: messages.getMessage('package'),
      longDescription: messages.getMessage('longPackage', []),
      exactlyOne: ['path', 'package'],
    }),
    path: flags.directory({
      char: 'd',
      description: messages.getMessage('path'),
      longDescription: messages.getMessage('longPath'),
      exactlyOne: ['path', 'package'],
      validate: (dir) => {
        if (!fs.existsSync(path.join(process.cwd(), dir))) {
          throw messages.createError('errorPathNotFound', [dir]);
        }
        return true;
      },
    }),
    postinstallscript: flags.string({
      description: messages.getMessage('postInstallScript'),
      longDescription: messages.getMessage('postInstallScriptLong'),
    }),
    postinstallurl: flags.url({
      description: messages.getMessage('postInstallUrl'),
      longDescription: messages.getMessage('postInstallUrlLong'),
    }),
    preserve: flags.boolean({
      char: 'r',
      description: messages.getMessage('preserve'),
      longDescription: messages.getMessage('longPreserve'),
      hidden: true,
    }),
    releasenotesurl: flags.url({
      description: messages.getMessage('releaseNotesUrl'),
      longDescription: messages.getMessage('releaseNotesUrlLong'),
    }),
    skipancestorcheck: flags.boolean({
      description: messages.getMessage('skipAncestorCheck'),
      longDescription: messages.getMessage('skipAncestorCheckLong'),
      default: false,
    }),
    skipvalidation: flags.boolean({
      description: messages.getMessage('skipValidation'),
      longDescription: messages.getMessage('skipValidationLong'),
      default: false,
      exclusive: ['codecoverage'],
    }),
    tag: flags.string({
      char: 't',
      description: messages.getMessage('tag'),
      longDescription: messages.getMessage('longTag'),
    }),
    uninstallscript: flags.string({
      description: messages.getMessage('uninstallScript'),
      longDescription: messages.getMessage('uninstallScriptLong'),
    }),
    validateschema: flags.boolean({
      char: 'j',
      description: messages.getMessage('validateschema'),
      longDescription: messages.getMessage('longValidateschema'),
      hidden: true,
    }),
    versiondescription: flags.string({
      char: 'e',
      description: messages.getMessage('versiondescription'),
      longDescription: messages.getMessage('longVersiondescription'),
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
    wait: flags.minutes({
      char: 'w',
      description: messages.getMessage('wait'),
      longDescription: messages.getMessage('longWait'),
      default: Duration.minutes(0),
    }),
  };

  public async run(): Promise<unknown> {
    if (this.flags.skipvalidation) {
      this.ux.warn(messages.getMessage('skipValidationWarning'));
    }

    // resolve the package name from the --package flag, first checking if it's an alias, then using the flag, and then looking for the package name from the --path flag
    // const packageName =
    //   getPackageAliasesFromId(this.flags.package, this.project)?.join() ??
    //   this.project.getPackageFromPath(this.flags.path)?.package ??
    //   (this.flags.package as string);

    let packageName: Optional<string>;
    if (this.flags.package) {
      if ((this.flags.package as string).startsWith('0Ho')) {
        packageName = this.flags.package as string;
      } else {
        packageName = getPackageIdFromAlias(this.flags.package, this.project);
      }
    } else if (this.flags.path) {
      packageName = this.project.getPackageFromPath(this.flags.path)?.package;
    }

    const packageId = getPackageIdFromAlias(packageName, this.project);

    const pvc = new PackageVersionCreate({
      ...this.flags,
      ...{ packageId, project: this.project, connection: this.hubOrg.getConnection() },
    });

    let result = await pvc.createPackageVersion();
    const waitSeconds = (this.flags.wait as Duration)?.seconds;

    if (waitSeconds) {
      let remainingWaitSeconds = waitSeconds;
      const frequency = this.flags.wait && this.flags.skipvalidation ? Duration.seconds(5) : Duration.seconds(30);
      const pc = new PollingClient({
        frequency,
        timeout: this.flags.wait as Duration,
        poll: async (): Promise<StatusResult> => {
          const status = await getCreatePackageVersionCreateRequestReport({
            createPackageVersionRequestId: result.Id,
            connection: this.hubOrg.getConnection(),
          });
          if (status.Status !== Package2VersionStatus.success && status.Status !== Package2VersionStatus.error) {
            this.ux.log(
              messages.getMessage('requestInProgress', [frequency.seconds, remainingWaitSeconds, status.Status])
            );
            remainingWaitSeconds -= frequency.seconds;
            return { completed: false, payload: status };
          } else {
            result = status;
            return { completed: true, payload: status };
          }
        },
      });
      await pc.subscribe();
    }

    switch (result.Status) {
      case 'Error':
        this.ux.log(messages.getMessage('unknownError', [result.Error.join('\n')]));
        break;
      case 'Success':
        this.ux.log(
          messages.getMessage(result.Status, [
            result.Id,
            result.SubscriberPackageVersionId,
            INSTALL_URL_BASE.toString(),
            result.SubscriberPackageVersionId,
          ])
        );
        break;
      default:
        this.ux.log(messages.getMessage('InProgress', [convertCamelCaseStringToSentence(result.Status), result.Id]));
    }
    // set packageAliases entry '<package>@<major>.<minor>.<patch>-<build>-<branch>: <result.subscriberPackageVersionId>'
    if (!process.env.SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE) {
      // get the newly created package version from the server
      const versionResult = (
        await this.hubOrg.getConnection().tooling.query<{
          Branch: string;
          MajorVersion: string;
          MinorVersion: string;
          PatchVersion: string;
          BuildNumber: string;
        }>(`SELECT Branch, MajorVersion, MinorVersion, PatchVersion, BuildNumber FROM Package2Version WHERE SubscriberPackageVersionId='${result.SubscriberPackageVersionId}'`)
      ).records[0];

      const version = `${packageName}@${versionResult.MajorVersion ?? 0}.${versionResult.MinorVersion ?? 0}.${
        versionResult.PatchVersion ?? 0
      }`;
      const build = versionResult.BuildNumber ? `-${versionResult.BuildNumber}` : '';
      const branch = versionResult.Branch ? `-${versionResult.Branch}` : '';
      this.project.getSfProjectJson().getContents().packageAliases[`${version}${build}${branch}`] =
        result.SubscriberPackageVersionId;
      await this.project.getSfProjectJson().write();
      this.ux.log('sfdx-project.json has been updated.');
    }
    return result;
  }
}
