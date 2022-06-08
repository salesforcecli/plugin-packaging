# plugin-packaging;

> :warning: **This module is under heavy development, please do not use in production.**

[![NPM](https://img.shields.io/npm/v/@salesforce/plugin-packaging.svg?label=@salesforce/plugin-packaging)](https://www.npmjs.com/package/@salesforce/plugin-packaging) [![CircleCI](https://circleci.com/gh/salesforcecli/plugin-packaging/tree/main.svg?style=shield)](https://circleci.com/gh/salesforcecli/plugin-packaging/tree/main) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/plugin-packaging.svg)](https://npmjs.org/package/@salesforce/plugin-packaging) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-packaging/main/LICENSE.txt)

## This plugin provides the sfdx cli commands that support Salesforce Packaging Platform

## Learn about the plugin-packaging

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

- [`sfdx force:package:placeholder [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcepackageplaceholder---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx force:package:placeholder [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx force:package:placeholder [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
```

_See code: [src/commands/force/package/placeholder.ts](https://github.com/salesforcecli/plugin-packaging/blob/v0.0.1/src/commands/force/package/placeholder.ts)_

<!-- commandsstop -->
