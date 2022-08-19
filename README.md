# plugin-packaging;

> :warning: **This plugin is currently in beta. We appreciate any feedback via https://github.com/forcedotcom/cli/issues**

[![NPM](https://img.shields.io/npm/v/@salesforce/plugin-packaging.svg?label=@salesforce/plugin-packaging)](https://www.npmjs.com/package/@salesforce/plugin-packaging) [![CircleCI](https://circleci.com/gh/salesforcecli/plugin-packaging/tree/main.svg?style=shield)](https://circleci.com/gh/salesforcecli/plugin-packaging/tree/main) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/plugin-packaging.svg)](https://npmjs.org/package/@salesforce/plugin-packaging) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-packaging/main/LICENSE.txt)

## This plugin provides the sfdx cli commands that support Salesforce Packaging Platform

## Install

```bash
sfdx plugins:install @salesforce/plugin-packaging@x.y.z
```

## Issues

Please report any issues at https://github.com/forcedotcom/cli/issues

## Contributing

1. Please read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Create a new issue before starting your project so that we can keep track of
   what you are trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
3. Fork this repository.
4. [Build the plugin locally](#build)
5. Create a _topic_ branch in your fork. Note, this step is recommended but technically not required if contributing using a fork.
6. Edit the code in your fork.
7. Write appropriate tests for your changes. Try to achieve at least 95% code coverage on any new code. No pull request will be accepted without unit tests.
8. Sign CLA (see [CLA](#cla) below).
9. Send us a pull request when you are done. We'll review your code, suggest any needed changes, and merge it in.

### CLA

External contributors will be required to sign a Contributor's License
Agreement. You can do so by going to https://cla.salesforce.com/sign-cla.

### Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:salesforcecli/plugin-packaging.git

# Install the dependencies and compile
yarn install
yarn build
```

To use your plugin, run using the local `./bin/run` or `./bin/run.cmd` file.

```bash
# Run using local run file.
./bin/run package:create --help
```

There should be no differences when running via the Salesforce CLI or using the local run file. However, it can be useful to link the plugin to do some additional testing or run your commands from anywhere on your machine.

```bash
# Link your plugin to the sfdx cli
sfdx plugins:link .
# To verify
sfdx plugins
```

## Commands

<!-- commands -->

- [`sfdx force:package1:beta:version:create -i <id> -n <string> [-d <string>] [-v <string>] [-m] [-r <url>] [-p <url>] [-k <string>] [-w <minutes>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackage1betaversioncreate--i-id--n-string--d-string--v-string--m--r-url--p-url--k-string--w-minutes--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package1:beta:version:create:get -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackage1betaversioncreateget--i-id--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package1:beta:version:display -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackage1betaversiondisplay--i-id--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package1:beta:version:list [-i <id>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackage1betaversionlist--i-id--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:create -n <string> -t Managed|Unlocked -r <directory> [-d <string>] [-e] [--orgdependent] [-o <string>] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetacreate--n-string--t-managedunlocked--r-directory--d-string--e---orgdependent--o-string--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:delete -p <string> [-n] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetadelete--p-string--n--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:install -p <string> [-w <minutes>] [-k <string>] [-b <minutes>] [-r] [-a all|package] [-s AllUsers|AdminsOnly] [-t DeprecateOnly|Mixed|Delete] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetainstall--p-string--w-minutes--k-string--b-minutes--r--a-allpackage--s-allusersadminsonly--t-deprecateonlymixeddelete--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:install:report -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetainstallreport--i-id--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:installed:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetainstalledlist--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:list [-v <string>] [--apiversion <string>] [--verbose] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetalist--v-string---apiversion-string---verbose---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:uninstall [-w <minutes>] [-p <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetauninstall--w-minutes--p-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:uninstall:report -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetauninstallreport--i-id--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:update -p <string> [-n <string>] [-d <string>] [-o <string>] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetaupdate--p-string--n-string--d-string--o-string--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:version:create [-p <string>] [-d <directory>] [-f <filepath>] [-b <string>] [-t <string>] [-k <string>] [-x] [-w <minutes>] [-a <string>] [-n <string>] [-e <string>] [-c] [--releasenotesurl <url>] [--postinstallurl <url>] [--postinstallscript <string>] [--uninstallscript <string>] [--skipvalidation] [--skipancestorcheck] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetaversioncreate--p-string--d-directory--f-filepath--b-string--t-string--k-string--x--w-minutes--a-string--n-string--e-string--c---releasenotesurl-url---postinstallurl-url---postinstallscript-string---uninstallscript-string---skipvalidation---skipancestorcheck--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:version:create:list [-c <number>] [-s Queued|InProgress|Success|Error] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetaversioncreatelist--c-number--s-queuedinprogresssuccesserror--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:version:create:report -i <id> [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetaversioncreatereport--i-id--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:version:delete -p <string> [-n] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetaversiondelete--p-string--n--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:version:displayancestry -p <string> [--dotcode] [-v <string>] [--apiversion <string>] [--verbose] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetaversiondisplayancestry--p-string---dotcode--v-string---apiversion-string---verbose---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:version:list [-c <number>] [-m <number>] [-p <array>] [-r] [-o <array>] [-v <string>] [--apiversion <string>] [--concise] [--verbose] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetaversionlist--c-number--m-number--p-array--r--o-array--v-string---apiversion-string---concise---verbose---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:version:promote -p <string> [-n] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetaversionpromote--p-string--n--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:version:report -p <string> [-v <string>] [--apiversion <string>] [--verbose] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetaversionreport--p-string--v-string---apiversion-string---verbose---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx force:package:beta:version:update -p <string> [-a <string>] [-e <string>] [-b <string>] [-t <string>] [-k <string>] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackagebetaversionupdate--p-string--a-string--e-string--b-string--t-string--k-string--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx force:package1:beta:version:create -i <id> -n <string> [-d <string>] [-v <string>] [-m] [-r <url>] [-p <url>] [-k <string>] [-w <minutes>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

create a first-generation package version in the release org

```
USAGE
  $ sfdx force:package1:beta:version:create -i <id> -n <string> [-d <string>] [-v <string>] [-m] [-r <url>] [-p <url>] [-k <string>] [-w
    <minutes>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -d, --description=<value>                                                         package version description
  -i, --packageid=<value>                                                           (required) ID of the metadata
                                                                                    package (starts with 033) of which
                                                                                    you’re creating a new version
  -k, --installationkey=<value>                                                     installation key for key-protected
                                                                                    package (default: null)
  -m, --managedreleased                                                             create a managed package version
  -n, --name=<value>                                                                (required) package version name
  -p, --postinstallurl=<value>                                                      post install URL
  -r, --releasenotesurl=<value>                                                     release notes URL
  -u, --targetusername=<value>                                                      username or alias for the target
                                                                                    org; overrides default target org
  -v, --version=<value>                                                             package version in major.minor
                                                                                    format, for example, 3.2
  -w, --wait=<value>                                                                minutes to wait for the package
                                                                                    version to be created (default: 2
                                                                                    minutes)
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  create a first-generation package version in the release org
```

_See code: [src/commands/force/package1/beta/version/create.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package1/beta/version/create.ts)_

## `sfdx force:package1:beta:version:create:get -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

retrieve the status of a package version creation request

```
USAGE
  $ sfdx force:package1:beta:version:create:get -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -i, --requestid=<value>                                                           (required) PackageUploadRequest ID
  -u, --targetusername=<value>                                                      username or alias for the target
                                                                                    org; overrides default target org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  retrieve the status of a package version creation request

EXAMPLES
  Examples:

  $ sfdx force:package1:version:create:get -i 0HD...

  $ sfdx force:package1:version:create:get -i 0HD... -u devhub@example.com
```

_See code: [src/commands/force/package1/beta/version/create/get.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package1/beta/version/create/get.ts)_

## `sfdx force:package1:beta:version:display -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

display details about a first-generation package version

```
USAGE
  $ sfdx force:package1:beta:version:display -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -i, --packageversionid=<value>                                                    (required) metadata package version
                                                                                    ID (starts with 04t)
  -u, --targetusername=<value>                                                      username or alias for the target
                                                                                    org; overrides default target org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  display details about a first-generation package version
```

_See code: [src/commands/force/package1/beta/version/display.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package1/beta/version/display.ts)_

## `sfdx force:package1:beta:version:list [-i <id>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list package versions for the specified first-generation package or for the org

```
USAGE
  $ sfdx force:package1:beta:version:list [-i <id>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -i, --packageid=<value>                                                           metadata package ID (starts with
                                                                                    033)
  -u, --targetusername=<value>                                                      username or alias for the target
                                                                                    org; overrides default target org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  list package versions for the specified first-generation package or for the org
```

_See code: [src/commands/force/package1/beta/version/list.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package1/beta/version/list.ts)_

## `sfdx force:package:beta:create -n <string> -t Managed|Unlocked -r <directory> [-d <string>] [-e] [--orgdependent] [-o <string>] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

create a package

```
USAGE
  $ sfdx force:package:beta:create -n <string> -t Managed|Unlocked -r <directory> [-d <string>] [-e] [--orgdependent] [-o
    <string>] [-v <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -d, --description=<value>                                                         package description
  -e, --nonamespace                                                                 creates the package with no
                                                                                    namespace; available only for
                                                                                    unlocked packages.
  -n, --name=<value>                                                                (required) package name
  -o, --errornotificationusername=<value>                                           active Dev Hub user designated to
                                                                                    receive email notifications for
                                                                                    package errors
  -r, --path=<value>                                                                (required) path to directory that
                                                                                    contains the contents of the package
  -t, --packagetype=(Managed|Unlocked)                                              (required) package type
  -v, --targetdevhubusername=<value>                                                username or alias for the dev hub
                                                                                    org; overrides default dev hub org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
  --orgdependent                                                                    depends on unpackaged metadata in
                                                                                    the installation org. Applies to
                                                                                    unlocked packages only.

DESCRIPTION
  create a package
```

_See code: [src/commands/force/package/beta/create.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/create.ts)_

## `sfdx force:package:beta:delete -p <string> [-n] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

delete a package

```
USAGE
  $ sfdx force:package:beta:delete -p <string> [-n] [-v <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -n, --noprompt                                                                    don’t prompt before deleting the
                                                                                    package
  -p, --package=<value>                                                             (required) ID (starts with 0Ho) or
                                                                                    alias of the package to delete
  -v, --targetdevhubusername=<value>                                                username or alias for the dev hub
                                                                                    org; overrides default dev hub org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  delete a package
```

_See code: [src/commands/force/package/beta/delete.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/delete.ts)_

## `sfdx force:package:beta:install -p <string> [-w <minutes>] [-k <string>] [-b <minutes>] [-r] [-a all|package] [-s AllUsers|AdminsOnly] [-t DeprecateOnly|Mixed|Delete] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

install a package in the target org

```
USAGE
  $ sfdx force:package:beta:install -p <string> [-w <minutes>] [-k <string>] [-b <minutes>] [-r] [-a all|package] [-s
    AllUsers|AdminsOnly] [-t DeprecateOnly|Mixed|Delete] [-u <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -a, --apexcompile=(all|package)
      [default: all] compile all Apex in the org and package, or only Apex in the package; unlocked packages only

  -b, --publishwait=<value>
      number of minutes to wait for subscriber package version ID to become available in the target org

  -k, --installationkey=<value>
      installation key for key-protected package (default: null)

  -p, --package=<value>
      (required) ID (starts with 04t) or alias of the package version to install

  -r, --noprompt
      do not prompt for confirmation

  -s, --securitytype=(AllUsers|AdminsOnly)
      [default: AdminsOnly] security access type for the installed package (deprecation notice: The default --securitytype
      value will change from AllUsers to AdminsOnly in v47.0 or later.)

  -t, --upgradetype=(DeprecateOnly|Mixed|Delete)
      [default: Mixed] the upgrade type for the package installation; available only for unlocked packages

  -u, --targetusername=<value>
      username or alias for the target org; overrides default target org

  -w, --wait=<value>
      number of minutes to wait for installation status

  --apiversion=<value>
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

DESCRIPTION
  install a package in the target org
```

_See code: [src/commands/force/package/beta/install.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/install.ts)_

## `sfdx force:package:beta:install:report -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

retrieve the status of a package installation request

```
USAGE
  $ sfdx force:package:beta:install:report -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -i, --requestid=<value>                                                           (required) ID of the package install
                                                                                    request you want to check
  -u, --targetusername=<value>                                                      username or alias for the target
                                                                                    org; overrides default target org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  retrieve the status of a package installation request
```

_See code: [src/commands/force/package/beta/install/report.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/install/report.ts)_

## `sfdx force:package:beta:installed:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list the org’s installed packages

```
USAGE
  $ sfdx force:package:beta:installed:list [-u <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -u, --targetusername=<value>                                                      username or alias for the target
                                                                                    org; overrides default target org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  list the org’s installed packages

EXAMPLES
  $ sfdx force:package:installed:list

  $ sfdx force:package:installed:list -u me@example.com
```

_See code: [src/commands/force/package/beta/installed/list.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/installed/list.ts)_

## `sfdx force:package:beta:list [-v <string>] [--apiversion <string>] [--verbose] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list all packages in the Dev Hub org

```
USAGE
  $ sfdx force:package:beta:list [-v <string>] [--apiversion <string>] [--verbose] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -v, --targetdevhubusername=<value>                                                username or alias for the dev hub
                                                                                    org; overrides default dev hub org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
  --verbose                                                                         display extended package detail

DESCRIPTION
  list all packages in the Dev Hub org
```

_See code: [src/commands/force/package/beta/list.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/list.ts)_

## `sfdx force:package:beta:uninstall [-w <minutes>] [-p <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

uninstall a second-generation package from the target org

```
USAGE
  $ sfdx force:package:beta:uninstall [-w <minutes>] [-p <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -p, --package=<value>                                                             ID (starts with 04t) or alias of the
                                                                                    package version to uninstall
  -u, --targetusername=<value>                                                      username or alias for the target
                                                                                    org; overrides default target org
  -w, --wait=<value>                                                                [default: 0 minutes] number of
                                                                                    minutes to wait for uninstall status
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  uninstall a second-generation package from the target org
```

_See code: [src/commands/force/package/beta/uninstall.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/uninstall.ts)_

## `sfdx force:package:beta:uninstall:report -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

retrieve status of package uninstall request

```
USAGE
  $ sfdx force:package:beta:uninstall:report -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -i, --requestid=<value>                                                           (required) ID of the package
                                                                                    uninstall request you want to check
  -u, --targetusername=<value>                                                      username or alias for the target
                                                                                    org; overrides default target org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  retrieve status of package uninstall request
```

_See code: [src/commands/force/package/beta/uninstall/report.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/uninstall/report.ts)_

## `sfdx force:package:beta:update -p <string> [-n <string>] [-d <string>] [-o <string>] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

update package details

```
USAGE
  $ sfdx force:package:beta:update -p <string> [-n <string>] [-d <string>] [-o <string>] [-v <string>] [--apiversion <string>]
    [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -d, --description=<value>                                                         new package description
  -n, --name=<value>                                                                new package name
  -o, --errornotificationusername=<value>                                           active Dev Hub user designated to
                                                                                    receive email notifications for
                                                                                    package errors
  -p, --package=<value>                                                             (required) ID (starts with 0Ho) or
                                                                                    alias of the package to update
  -v, --targetdevhubusername=<value>                                                username or alias for the dev hub
                                                                                    org; overrides default dev hub org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  update package details
```

_See code: [src/commands/force/package/beta/update.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/update.ts)_

## `sfdx force:package:beta:version:create [-p <string>] [-d <directory>] [-f <filepath>] [-b <string>] [-t <string>] [-k <string>] [-x] [-w <minutes>] [-a <string>] [-n <string>] [-e <string>] [-c] [--releasenotesurl <url>] [--postinstallurl <url>] [--postinstallscript <string>] [--uninstallscript <string>] [--skipvalidation] [--skipancestorcheck] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

create a package version

```
USAGE
  $ sfdx force:package:beta:version:create [-p <string>] [-d <directory>] [-f <filepath>] [-b <string>] [-t <string>] [-k <string>]
    [-x] [-w <minutes>] [-a <string>] [-n <string>] [-e <string>] [-c] [--releasenotesurl <url>] [--postinstallurl
    <url>] [--postinstallscript <string>] [--uninstallscript <string>] [--skipvalidation] [--skipancestorcheck] [-v
    <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -a, --versionname=<value>                                                         the name of the package version to
                                                                                    be created
  -b, --branch=<value>                                                              the package version’s branch
  -c, --codecoverage                                                                calculate the code coverage by
                                                                                    running the packaged Apex tests
  -d, --path=<value>                                                                path to directory that contains the
                                                                                    contents of the package
  -e, --versiondescription=<value>                                                  the description of the package
                                                                                    version to be created
  -f, --definitionfile=<value>                                                      path to a definition file similar to
                                                                                    scratch org definition file that
                                                                                    contains the list of features and
                                                                                    org preferences that the metadata of
                                                                                    the package version depends on
  -k, --installationkey=<value>                                                     installation key for key-protected
                                                                                    package (either --installationkey or
                                                                                    --installationkeybypass is required)
  -n, --versionnumber=<value>                                                       the version number of the package
                                                                                    version to be created
  -p, --package=<value>                                                             ID (starts with 0Ho) or alias of the
                                                                                    package to create a version of
  -t, --tag=<value>                                                                 the package version’s tag
  -v, --targetdevhubusername=<value>                                                username or alias for the dev hub
                                                                                    org; overrides default dev hub org
  -w, --wait=<value>                                                                [default: 0 minutes] minutes to wait
                                                                                    for the package version to be
                                                                                    created
  -x, --installationkeybypass                                                       bypass the installation key
                                                                                    requirement (either
                                                                                    --installationkey or
                                                                                    --installationkeybypass is required)
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
  --postinstallscript=<value>                                                       post-install script name; managed
                                                                                    packages only
  --postinstallurl=<value>                                                          post-install URL
  --releasenotesurl=<value>                                                         release notes URL
  --skipancestorcheck                                                               Overrides ancestry requirements.
  --skipvalidation                                                                  skip validation during package
                                                                                    version creation; you can’t promote
                                                                                    unvalidated package versions
  --uninstallscript=<value>                                                         uninstall script name; managed
                                                                                    packages only

DESCRIPTION
  create a package version
```

_See code: [src/commands/force/package/beta/version/create.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/version/create.ts)_

## `sfdx force:package:beta:version:create:list [-c <number>] [-s Queued|InProgress|Success|Error] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list package version creation requests

```
USAGE
  $ sfdx force:package:beta:version:create:list [-c <number>] [-s Queued|InProgress|Success|Error] [-v <string>] [--apiversion <string>]
    [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -c, --createdlastdays=<value>                                                     created in the last specified number
                                                                                    of days (starting at 00:00:00 of
                                                                                    first day to now; 0 for today)
  -s, --status=(Queued|InProgress|Success|Error)                                    filter the list by version creation
                                                                                    request status
  -v, --targetdevhubusername=<value>                                                username or alias for the dev hub
                                                                                    org; overrides default dev hub org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  list package version creation requests
```

_See code: [src/commands/force/package/beta/version/create/list.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/version/create/list.ts)_

## `sfdx force:package:beta:version:create:report -i <id> [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

retrieve details about a package version creation request

```
USAGE
  $ sfdx force:package:beta:version:create:report -i <id> [-v <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -i, --packagecreaterequestid=<value>                                              (required) package version creation
                                                                                    request ID (starts with 08c)
  -v, --targetdevhubusername=<value>                                                username or alias for the dev hub
                                                                                    org; overrides default dev hub org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  retrieve details about a package version creation request
```

_See code: [src/commands/force/package/beta/version/create/report.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/version/create/report.ts)_

## `sfdx force:package:beta:version:delete -p <string> [-n] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

delete a package version

```
USAGE
  $ sfdx force:package:beta:version:delete -p <string> [-n] [-v <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -n, --noprompt                                                                    don’t prompt before deleting the
                                                                                    package version
  -p, --package=<value>                                                             (required) ID (starts with 04t) or
                                                                                    alias of the package to update a
                                                                                    version of
  -v, --targetdevhubusername=<value>                                                username or alias for the dev hub
                                                                                    org; overrides default dev hub org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  delete a package version
```

_See code: [src/commands/force/package/beta/version/delete.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/version/delete.ts)_

## `sfdx force:package:beta:version:displayancestry -p <string> [--dotcode] [-v <string>] [--apiversion <string>] [--verbose] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

display the ancestry tree for a 2GP managed package version

```
USAGE
  $ sfdx force:package:beta:version:displayancestry -p <string> [--dotcode] [-v <string>] [--apiversion <string>] [--verbose] [--json]
    [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -p, --package=<value>                                                             (required) ID or alias of the
                                                                                    package (starts with 0Ho) or package
                                                                                    version (starts with 04t) to display
                                                                                    ancestry for
  -v, --targetdevhubusername=<value>                                                username or alias for the dev hub
                                                                                    org; overrides default dev hub org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --dotcode                                                                         display the ancestry tree in DOT
                                                                                    code
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
  --verbose                                                                         display both the package version ID
                                                                                    (starts with 04t) and the version
                                                                                    number (major.minor.patch.build) in
                                                                                    the ancestry tree

DESCRIPTION
  display the ancestry tree for a 2GP managed package version
```

_See code: [src/commands/force/package/beta/version/displayancestry.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/version/displayancestry.ts)_

## `sfdx force:package:beta:version:list [-c <number>] [-m <number>] [-p <array>] [-r] [-o <array>] [-v <string>] [--apiversion <string>] [--concise] [--verbose] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list all package versions in the Dev Hub org

```
USAGE
  $ sfdx force:package:beta:version:list [-c <number>] [-m <number>] [-p <array>] [-r] [-o <array>] [-v <string>] [--apiversion
    <string>] [--concise] [--verbose] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -c, --createdlastdays=<value>                                                     created in the last specified number
                                                                                    of days (starting at 00:00:00 of
                                                                                    first day to now; 0 for today)
  -m, --modifiedlastdays=<value>                                                    list items modified in the specified
                                                                                    last number of days (starting at
                                                                                    00:00:00 of first day to now; 0 for
                                                                                    today)
  -o, --orderby=<value>                                                             order by the specified package
                                                                                    version fields
  -p, --packages=<value>                                                            filter results on specified
                                                                                    comma-delimited packages (aliases or
                                                                                    0Ho IDs)
  -r, --released                                                                    display released versions only
  -v, --targetdevhubusername=<value>                                                username or alias for the dev hub
                                                                                    org; overrides default dev hub org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --concise                                                                         display limited package version
                                                                                    details
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
  --verbose                                                                         display extended package version
                                                                                    details

DESCRIPTION
  list all package versions in the Dev Hub org
```

_See code: [src/commands/force/package/beta/version/list.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/version/list.ts)_

## `sfdx force:package:beta:version:promote -p <string> [-n] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

promote a package version to released

```
USAGE
  $ sfdx force:package:beta:version:promote -p <string> [-n] [-v <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -n, --noprompt                                                                    no prompt to confirm setting the
                                                                                    package version as released
  -p, --package=<value>                                                             (required) ID (starts with 04t) or
                                                                                    alias of the package version to
                                                                                    promote
  -v, --targetdevhubusername=<value>                                                username or alias for the dev hub
                                                                                    org; overrides default dev hub org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  promote a package version to released
```

_See code: [src/commands/force/package/beta/version/promote.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/version/promote.ts)_

## `sfdx force:package:beta:version:report -p <string> [-v <string>] [--apiversion <string>] [--verbose] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

retrieve details about a package version in the Dev Hub org

```
USAGE
  $ sfdx force:package:beta:version:report -p <string> [-v <string>] [--apiversion <string>] [--verbose] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -p, --package=<value>                                                             (required) ID (starts with 04t) or
                                                                                    alias of the package to retrieve
                                                                                    details for
  -v, --targetdevhubusername=<value>                                                username or alias for the dev hub
                                                                                    org; overrides default dev hub org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
  --verbose                                                                         displays extended package version
                                                                                    details

DESCRIPTION
  retrieve details about a package version in the Dev Hub org
```

_See code: [src/commands/force/package/beta/version/report.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/version/report.ts)_

## `sfdx force:package:beta:version:update -p <string> [-a <string>] [-e <string>] [-b <string>] [-t <string>] [-k <string>] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

update a package version

```
USAGE
  $ sfdx force:package:beta:version:update -p <string> [-a <string>] [-e <string>] [-b <string>] [-t <string>] [-k <string>] [-v
    <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -a, --versionname=<value>                                                         new package version name
  -b, --branch=<value>                                                              new package version branch
  -e, --versiondescription=<value>                                                  new package version description
  -k, --installationkey=<value>                                                     new installation key for
                                                                                    key-protected package (default:
                                                                                    null)
  -p, --package=<value>                                                             (required) ID (starts with 04t) or
                                                                                    alias of the package to update a
                                                                                    version of
  -t, --tag=<value>                                                                 new package version tag
  -v, --targetdevhubusername=<value>                                                username or alias for the dev hub
                                                                                    org; overrides default dev hub org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  update a package version
```

_See code: [src/commands/force/package/beta/version/update.ts](https://github.com/salesforcecli/plugin-packaging/blob/v1.1.1/src/commands/force/package/beta/version/update.ts)_

<!-- commandsstop -->
