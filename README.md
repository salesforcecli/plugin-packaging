# plugin-packaging;

[![NPM](https://img.shields.io/npm/v/@salesforce/plugin-packaging.svg?label=@salesforce/plugin-packaging)](https://www.npmjs.com/package/@salesforce/plugin-packaging) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/plugin-packaging.svg)](https://npmjs.org/package/@salesforce/plugin-packaging) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-packaging/main/LICENSE.txt)

### This plugin provides the sf cli commands that support the Salesforce Packaging Platform.

## Install

This plugin is bundled with the Salesforce CLI, so you typically don't need to install it. However, if you want to install a specific version of the plugin you can run:

```bash
sf plugins:install @salesforce/plugin-packaging@x.y.z
```

_NOTE: If you install a specific version of a bundled plugin you will not get an updated packaging plugin when the CLI updates. You must either update to the packaging plugin version you want manually, or uninstall the version of the plugin you have to go back to the CLI bundled version._

## Issues

Please report any issues at https://github.com/forcedotcom/cli/issues

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Developing

See [DEVELOPING.md](DEVELOPING.md)

## Commands

<!-- commands -->

- [`sf package1 version create`](#sf-package1-version-create)
- [`sf package1 version create get`](#sf-package1-version-create-get)
- [`sf package1 version display`](#sf-package1-version-display)
- [`sf package1 version list`](#sf-package1-version-list)
- [`sf package create`](#sf-package-create)
- [`sf package delete`](#sf-package-delete)
- [`sf package install`](#sf-package-install)
- [`sf package install report`](#sf-package-install-report)
- [`sf package installed list`](#sf-package-installed-list)
- [`sf package list`](#sf-package-list)
- [`sf package uninstall`](#sf-package-uninstall)
- [`sf package uninstall report`](#sf-package-uninstall-report)
- [`sf package update`](#sf-package-update)
- [`sf package version create`](#sf-package-version-create)
- [`sf package version create list`](#sf-package-version-create-list)
- [`sf package version create report`](#sf-package-version-create-report)
- [`sf package version delete`](#sf-package-version-delete)
- [`sf package version displayancestry`](#sf-package-version-displayancestry)
- [`sf package version list`](#sf-package-version-list)
- [`sf package version promote`](#sf-package-version-promote)
- [`sf package version report`](#sf-package-version-report)
- [`sf package version update`](#sf-package-version-update)

## `sf package1 version create`

Create a first-generation package version in the release org.

```
USAGE
  $ sf package1 version create -o <value> -i <value> -n <value> [--json] [--flags-dir <value>] [--api-version <value>] [-d
    <value>] [-v <value>] [-m] [-r <value>] [-p <value>] [-k <value>] [-w <value>]

FLAGS
  -d, --description=<value>        Package version description.
  -i, --package-id=<value>         (required) ID of the metadata package (starts with 033) of which you’re creating a
                                   new version.
  -k, --installation-key=<value>   Installation key for key-protected package (default: null).
  -m, --managed-released           Create a managed package version.
  -n, --name=<value>               (required) Package version name.
  -o, --target-org=<value>         (required) Username or alias of the target org. Not required if the `target-org`
                                   configuration variable is already set.
  -p, --post-install-url=<value>   Post install URL.
  -r, --release-notes-url=<value>  Release notes URL.
  -v, --version=<value>            Package version in major.minor format, for example, 3.2.
  -w, --wait=<value>               Minutes to wait for the package version to be created (default: 2 minutes).
      --api-version=<value>        Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Create a first-generation package version in the release org.

  The package version is based on the contents of the specified metadata package. Omit --managed-released if you want to
  create an unmanaged package version.

ALIASES
  $ sf force package1 version create

EXAMPLES
  Create a first-generation package version from the package with the specified ID and name the package version
  "example"; use your default org:

    $ sf package1 version create --package-id 033... --name example

  Same as previous example, but provide a description and wait for 30 minutes for the package version to be created;
  use the specified org:

    $ sf package1 version create --package-id 033... --name example --description "example description" --wait 30 \
      --target-org myorg@example.com

FLAG DESCRIPTIONS
  -m, --managed-released  Create a managed package version.

    To create a beta version, don’t include this parameter.

  -p, --post-install-url=<value>  Post install URL.

    The contents of the post-installation instructions URL are displayed in the UI after installation of the package
    version.

  -r, --release-notes-url=<value>  Release notes URL.

    This link is displayed in the package installation UI to provide release notes for this package version to
    subscribers.
```

_See code: [src/commands/package1/version/create.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package1/version/create.ts)_

## `sf package1 version create get`

Retrieve the status of a package version creation request.

```
USAGE
  $ sf package1 version create get -o <value> -i <value> [--json] [--flags-dir <value>] [--api-version <value>]

FLAGS
  -i, --request-id=<value>   (required) ID of the PackageUploadRequest (starts with 0HD).
  -o, --target-org=<value>   (required) Username or alias of the target org. Not required if the `target-org`
                             configuration variable is already set.
      --api-version=<value>  Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

ALIASES
  $ sf force package1 version create get

EXAMPLES
  Get the status of the creation request for the package version with the specified ID in your default org:

    $ sf package1 version create get --request-id 0HD...

  Same as previous example, but use the specified org:

    $ sf package1 version create get --request-id 0HD... --target-org myorg@example.com
```

_See code: [src/commands/package1/version/create/get.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package1/version/create/get.ts)_

## `sf package1 version display`

Display details about a first-generation package version.

```
USAGE
  $ sf package1 version display -o <value> -i <value> [--json] [--flags-dir <value>] [--api-version <value>]

FLAGS
  -i, --package-version-id=<value>  (required) ID (starts with 04t) of the metadata package version whose details you
                                    want to display.
  -o, --target-org=<value>          (required) Username or alias of the target org. Not required if the `target-org`
                                    configuration variable is already set.
      --api-version=<value>         Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

ALIASES
  $ sf force package1 version display

EXAMPLES
  Display details about the first-generation package version with the specified ID in your default org:

    $ sf package1 version display --package-version-id 04t...

  Same as previous example, but use the specified org:

    $ sf package1 version display --package-version-id 04t... --target-org myorg@example.com
```

_See code: [src/commands/package1/version/display.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package1/version/display.ts)_

## `sf package1 version list`

List package versions for the specified first-generation package or for the org.

```
USAGE
  $ sf package1 version list -o <value> [--json] [--flags-dir <value>] [--api-version <value>] [-i <value>]

FLAGS
  -i, --package-id=<value>   Metadata package ID (starts with 033) whose package versions you want to list.
  -o, --target-org=<value>   (required) Username or alias of the target org. Not required if the `target-org`
                             configuration variable is already set.
      --api-version=<value>  Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

ALIASES
  $ sf force package1 version list

EXAMPLES
  List all first-generation package versions in your default org:

    $ sf package1 version list

  List package versions for the specified first-generation package in the specifief org:

    $ sf package1 version list --package-id 033... --target-org myorg@example.com

FLAG DESCRIPTIONS
  -i, --package-id=<value>  Metadata package ID (starts with 033) whose package versions you want to list.

    If not specified, shows all versions for all packages (managed and unmanaged) in the org.
```

_See code: [src/commands/package1/version/list.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package1/version/list.ts)_

## `sf package create`

Create a package.

```
USAGE
  $ sf package create -v <value> -n <value> -t Managed|Unlocked -r <value> [--json] [--flags-dir <value>]
    [--api-version <value>] [-d <value>] [-e] [--org-dependent] [-o <value>]

FLAGS
  -d, --description=<value>                  Description of the package.
  -e, --no-namespace                         Create the package with no namespace; available only for unlocked packages.
  -n, --name=<value>                         (required) Name of the package to create.
  -o, --error-notification-username=<value>  Active Dev Hub user designated to receive email notifications for package
                                             errors.
  -r, --path=<value>                         (required) Path to directory that contains the contents of the package.
  -t, --package-type=<option>                (required) Type of package.
                                             <options: Managed|Unlocked>
  -v, --target-dev-hub=<value>               (required) Username or alias of the Dev Hub org. Not required if the
                                             `target-dev-hub` configuration variable is already set.
      --api-version=<value>                  Override the api version used for api requests made by this command
      --org-dependent                        Depends on unpackaged metadata in the installation org; applies to unlocked
                                             packages only.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Create a package.

  First, use this command to create a package. Then create a package version.

  If you don’t have a namespace defined in your sfdx-project.json file, use --no-namespace.

  Your --name value must be unique within your namespace.

  Run 'sf package list to list all packages in the Dev Hub org.

ALIASES
  $ sf force package create

EXAMPLES
  Create an unlocked package from the files in the "force-app" directory; uses your default Dev Hub org:

    $ sf package create --name MyUnlockedPackage --package-type Unlocked --path force-app

  Create a managed packaged from the "force-app" directory files, give the package a description, and use the
  specified Dev Hub org:

    $ sf package create --name MyManagedPackage --description "Your Package Descripton" --package-type Managed \
      --path force-app --target-dev-hub devhub@example.com

FLAG DESCRIPTIONS
  -e, --no-namespace  Create the package with no namespace; available only for unlocked packages.

    This flag is useful when you’re migrating an existing org to packages. But use a namespaced package for new
    metadata.

  -o, --error-notification-username=<value>

    Active Dev Hub user designated to receive email notifications for package errors.

    Email notifications include information about unhandled Apex exceptions, and install, upgrade, or uninstall failures
    associated with your package.

  -t, --package-type=Managed|Unlocked  Type of package.

    The options for package type are Managed and Unlocked (Managed=DeveloperManagedSubscriberManaged,
    Unlocked=DeveloperControlledSubscriberEditable). These options determine upgrade and editability rules.

  --org-dependent  Depends on unpackaged metadata in the installation org; applies to unlocked packages only.

    Use Source Tracking in Sandboxes to develop your org-dependent unlocked package. For more information, see "Create
    Org-Dependent Unlocked Packages" in the Salesforce DX Developer Guide.
```

_See code: [src/commands/package/create.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/create.ts)_

## `sf package delete`

Delete a package.

```
USAGE
  $ sf package delete -v <value> -p <value> [--json] [--flags-dir <value>] [--api-version <value>] [-n]

FLAGS
  -n, --no-prompt               Don’t prompt before deleting the package.
  -p, --package=<value>         (required) ID (starts with 0Ho) or alias of the package to delete.
  -v, --target-dev-hub=<value>  (required) Username or alias of the Dev Hub org. Not required if the `target-dev-hub`
                                configuration variable is already set.
      --api-version=<value>     Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Delete a package.

  Specify the ID or alias of the package you want to delete.

  Delete unlocked and second-generation managed packages. Before you delete a package, first delete all associated
  package versions.

ALIASES
  $ sf force package delete

EXAMPLES
  Delete a package using its alias from your default Dev Hub org:

    $ sf package delete --package "Your Package Alias"

  Delete a package using its ID from the specified Dev Hub org:

    $ sf package delete --package 0Ho... --target-dev-hub devhub@example.com
```

_See code: [src/commands/package/delete.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/delete.ts)_

## `sf package install`

Install a version of a package in the target org.

```
USAGE
  $ sf package install -o <value> -p <value> [--json] [--flags-dir <value>] [--api-version <value>] [-w <value>] [-k
    <value>] [-b <value>] [-r] [-a all|package] [-s AllUsers|AdminsOnly] [-t DeprecateOnly|Mixed|Delete]

FLAGS
  -a, --apex-compile=<option>     [default: all] Compile all Apex in the org and package, or only Apex in the package;
                                  unlocked packages only.
                                  <options: all|package>
  -b, --publish-wait=<value>      Maximum number of minutes to wait for the Subscriber Package Version ID to become
                                  available in the target org before canceling the install request.
  -k, --installation-key=<value>  Installation key for key-protected package (default: null).
  -o, --target-org=<value>        (required) Username or alias of the target org. Not required if the `target-org`
                                  configuration variable is already set.
  -p, --package=<value>           (required) ID (starts with 04t) or alias of the package version to install.
  -r, --no-prompt                 Don't prompt for confirmation.
  -s, --security-type=<option>    [default: AdminsOnly] Security access type for the installed package. (deprecation
                                  notice: The default --security-type value will change from AllUsers to AdminsOnly in
                                  v47.0 or later.)
                                  <options: AllUsers|AdminsOnly>
  -t, --upgrade-type=<option>     [default: Mixed] Upgrade type for the package installation; available only for
                                  unlocked packages.
                                  <options: DeprecateOnly|Mixed|Delete>
  -w, --wait=<value>              Number of minutes to wait for installation status.
      --api-version=<value>       Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Install a version of a package in the target org.

  To install a package, specify a specific version of the package using the 04t package ID. The package and the version
  you specified installs in your default target org unless you supply the username for a different target org.

  For package upgrades, to specify options for component deprecation or deletion of removed components, include an
  --upgrade-type value. To delete components that can be safely deleted and deprecate the others, specify --upgrade-type
  Mixed (the default). To deprecate all removed components, specify --upgrade-type DeprecateOnly. To delete all removed
  components, except for custom objects and custom fields, that don't have dependencies, specify --upgrade-type Delete.
  (Note: This option can result in the loss of data that is associated with the deleted components.) The default is
  Mixed.

ALIASES
  $ sf force package install

EXAMPLES
  Install a package version with the specified ID in the org with username "me@example.com":

    $ sf package install --package 04t... --target-org me@example.com

  Install a package version with the specified alias into your default org:

    $ sf package install --package awesome_package_alias

  Install a package version with an alias that includes spaces into your default org:

    $ sf package install --package "Awesome Package Alias"

  Install an unlocked package version with the specified ID and deprecate all removed components:

    $ sf package install --package 04t... --upgrade-type DeprecateOnly

FLAG DESCRIPTIONS
  -a, --apex-compile=all|package

    Compile all Apex in the org and package, or only Apex in the package; unlocked packages only.

    Applies to unlocked packages only. Specifies whether to compile all Apex in the org and package, or only the Apex in
    the package.

    For package installs into production orgs, or any org that has Apex Compile on Deploy enabled, the platform compiles
    all Apex in the org after the package install or upgrade operation completes.

    This approach assures that package installs and upgrades don’t impact the performance of an org, and is done even if
    --apex-compile package is specified.

  -r, --no-prompt  Don't prompt for confirmation.

    Allows the following without an explicit confirmation response: 1) Remote Site Settings and Content Security Policy
    websites to send or receive data, and 2) --upgrade-type Delete to proceed.

  -t, --upgrade-type=DeprecateOnly|Mixed|Delete

    Upgrade type for the package installation; available only for unlocked packages.

    For package upgrades, specifies whether to mark all removed components as deprecated (DeprecateOnly), to delete
    removed components that can be safely deleted and deprecate the others (Mixed), or to delete all removed components,
    except for custom objects and custom fields, that don't have dependencies (Delete). The default is Mixed. Can
    specify DeprecateOnly or Delete only for unlocked package upgrades.
```

_See code: [src/commands/package/install.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/install.ts)_

## `sf package install report`

Retrieve the status of a package installation request.

```
USAGE
  $ sf package install report -o <value> -i <value> [--json] [--flags-dir <value>] [--api-version <value>]

FLAGS
  -i, --request-id=<value>   (required) ID of the package install request you want to check; starts with 0Hf.
  -o, --target-org=<value>   (required) Username or alias of the target org. Not required if the `target-org`
                             configuration variable is already set.
      --api-version=<value>  Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

ALIASES
  $ sf force package install report

EXAMPLES
  Retrieve the status of a package installation request with the specified ID on your default org:

    $ sf package install report --request-id 0Hf...

  Similar to previous example, except use the org with username me@example.com:

    $ sf package install report --request-id 0Hf... --target-org me@example.com
```

_See code: [src/commands/package/install/report.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/install/report.ts)_

## `sf package installed list`

List the org’s installed packages.

```
USAGE
  $ sf package installed list -o <value> [--json] [--flags-dir <value>] [--api-version <value>]

FLAGS
  -o, --target-org=<value>   (required) Username or alias of the target org. Not required if the `target-org`
                             configuration variable is already set.
      --api-version=<value>  Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

ALIASES
  $ sf force package installed list

EXAMPLES
  List the installed packages in your default org:

    $ sf package installed list

  List the installed packages in the org with username me@example.com:

    $ sf package installed list --target-org me@example.com
```

_See code: [src/commands/package/installed/list.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/installed/list.ts)_

## `sf package list`

List all packages in the Dev Hub org.

```
USAGE
  $ sf package list -v <value> [--json] [--flags-dir <value>] [--api-version <value>] [--verbose]

FLAGS
  -v, --target-dev-hub=<value>  (required) Username or alias of the Dev Hub org. Not required if the `target-dev-hub`
                                configuration variable is already set.
      --api-version=<value>     Override the api version used for api requests made by this command
      --verbose                 Display extended package detail.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  List all packages in the Dev Hub org.

  Description

ALIASES
  $ sf force package list

EXAMPLES
  List all packages in the specified Dev Hub org:

    $ sf package list --target-dev-hub devhub@example.com

  List all packages details in the specified Dev Hub org, and show extended details about each package:

    $ sf package list --target-dev-hub devhub@example.com --verbose
```

_See code: [src/commands/package/list.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/list.ts)_

## `sf package uninstall`

Uninstall a second-generation package from the target org.

```
USAGE
  $ sf package uninstall -o <value> -p <value> [--json] [--flags-dir <value>] [--api-version <value>] [-w <value>]

FLAGS
  -o, --target-org=<value>   (required) Username or alias of the target org. Not required if the `target-org`
                             configuration variable is already set.
  -p, --package=<value>      (required) ID (starts with 04t) or alias of the package version to uninstall.
  -w, --wait=<value>         Number of minutes to wait for uninstall status.
      --api-version=<value>  Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Uninstall a second-generation package from the target org.

  Specify the package ID for a second-generation package.

  To list the org’s installed packages, run "sf package installed list".

  To uninstall a first-generation package, from Setup, enter Installed Packages in the Quick Find box, then select
  Installed Packages.

ALIASES
  $ sf force package uninstall

EXAMPLES
  Uninstall a package with specified ID from an org with username me@example.com:

    $ sf package uninstall --package 04t... --target-org me@example.com

  Uninstall a package with the specified alias from your default org:

    $ sf package uninstall --package undesirable_package_alias

  Uninstall a package with an alias that contains spaces from your default org:

    $ sf package uninstall --package "Undesirable Package Alias"
```

_See code: [src/commands/package/uninstall.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/uninstall.ts)_

## `sf package uninstall report`

Retrieve the status of a package uninstall request.

```
USAGE
  $ sf package uninstall report -o <value> -i <value> [--json] [--flags-dir <value>] [--api-version <value>]

FLAGS
  -i, --request-id=<value>   (required) ID of the package uninstall request you want to check; starts with 06y.
  -o, --target-org=<value>   (required) Username or alias of the target org. Not required if the `target-org`
                             configuration variable is already set.
      --api-version=<value>  Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

ALIASES
  $ sf force package uninstall report

EXAMPLES
  Retrieve the status of a package uninstall in your default org using the specified request ID:

    $ sf package uninstall report --request-id 06y...

  Similar to previous example, but use the org with username me@example.com:

    $ sf package uninstall report --request-id 06y... --target-org me@example.com
```

_See code: [src/commands/package/uninstall/report.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/uninstall/report.ts)_

## `sf package update`

Update package details.

```
USAGE
  $ sf package update -v <value> -p <value> [--json] [--flags-dir <value>] [--api-version <value>] [-n <value>] [-d
    <value>] [-o <value>] [--enable-app-analytics]

FLAGS
  -d, --description=<value>                  New description of the package.
  -n, --name=<value>                         New name of the package.
  -o, --error-notification-username=<value>  Active Dev Hub user designated to receive email notifications for package
                                             errors.
  -p, --package=<value>                      (required) ID (starts with 0Ho) or alias of the package to update.
  -v, --target-dev-hub=<value>               (required) Username or alias of the Dev Hub org. Not required if the
                                             `target-dev-hub` configuration variable is already set.
      --api-version=<value>                  Override the api version used for api requests made by this command
      --[no-]enable-app-analytics            Enable AppExchange App Analytics usage data collection on this managed
                                             package and its components.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Update package details.

  Specify a new value for each option you want to update.

  Run "sf package list" to list all packages in the Dev Hub org.

ALIASES
  $ sf force package update

EXAMPLES
  Update the name of the package with the specified alias; uses your default Dev Hub org:

    $ sf package update --package "Your Package Alias" --name "New Package Name"

  Update the description of the package with the specified ID; uses the specified Dev Hub org:

    $ sf package update --package 0Ho... --description "New Package Description" --target-dev-hub devhub@example.com

FLAG DESCRIPTIONS
  -o, --error-notification-username=<value>

    Active Dev Hub user designated to receive email notifications for package errors.

    Email notifications include information about unhandled Apex exceptions, and install, upgrade, or uninstall failures
    associated with your package.
```

_See code: [src/commands/package/update.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/update.ts)_

## `sf package version create`

Create a package version in the Dev Hub org.

```
USAGE
  $ sf package version create -v <value> [--json] [--flags-dir <value>] [--api-version <value>] [-b <value>] [-c |
    --skip-validation] [-f <value>] [-k <value>] [-x] [-p <value>] [-d <value>] [--post-install-script <value>]
    [--post-install-url <value>] [--releasenotes-url <value>] [--skip-ancestor-check] [-t <value>] [--uninstall-script
    <value>] [-e <value>] [-a <value>] [-n <value>] [-w <value>] [--language <value>] [--verbose]

FLAGS
  -a, --version-name=<value>         Name of the package version to be created; overrides the sfdx-project.json value.
  -b, --branch=<value>               Name of the branch in your source control system that the package version is based
                                     on.
  -c, --code-coverage                Calculate and store the code coverage percentage by running the packaged Apex tests
                                     included in this package version.
  -d, --path=<value>                 Path to the directory that contains the contents of the package.
  -e, --version-description=<value>  Description of the package version to be created; overrides the sfdx-project.json
                                     value.
  -f, --definition-file=<value>      Path to a definition file similar to scratch org definition file that contains the
                                     list of features and org preferences that the metadata of the package version
                                     depends on.
  -k, --installation-key=<value>     Installation key for key-protected package. (either --installation-key or
                                     --installation-key-bypass is required)
  -n, --version-number=<value>       Version number of the package version to be created; overrides the
                                     sfdx-project.json value.
  -p, --package=<value>              ID (starts with 0Ho) or alias of the package to create a version of.
  -t, --tag=<value>                  Package version’s tag.
  -v, --target-dev-hub=<value>       (required) Username or alias of the Dev Hub org. Not required if the
                                     `target-dev-hub` configuration variable is already set.
  -w, --wait=<value>                 Number of minutes to wait for the package version to be created.
  -x, --installation-key-bypass      Bypass the installation key requirement. (either --installation-key or
                                     --installation-key-bypass is required)
      --api-version=<value>          Override the api version used for api requests made by this command
      --language=<value>             Language for the package.
      --post-install-script=<value>  Name of the post-install script; applies to managed packages only.
      --post-install-url=<value>     Post-install instructions URL.
      --releasenotes-url=<value>     Release notes URL.
      --skip-ancestor-check          Overrides ancestry requirements, which allows you to specify a package ancestor
                                     that isn’t the highest released package version.
      --skip-validation              Skip validation during package version creation; you can’t promote unvalidated
                                     package versions.
      --uninstall-script=<value>     Uninstall script name; applies to managed packages only.
      --verbose                      Display verbose command output.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Create a package version in the Dev Hub org.

  The package version is based on the package contents in the specified directory.

  To retrieve details about a package version create request, including status and package version ID (04t), run "sf
  package version create report -i 08c...".

  We recommend that you specify the --installation-key parameter to protect the contents of your package and to prevent
  unauthorized installation of your package.

  To list package version creation requests in the org, run "sf package version create list".
  To promote a package version to released, you must use the --code-coverage parameter. The package must also meet the
  code coverage requirements. This requirement applies to both managed and unlocked packages.

  We don’t calculate code coverage for org-dependent unlocked packages, or for package versions that specify
  --skip-validation.

ALIASES
  $ sf force package version create

EXAMPLES
  Create a package version from the contents of the "common" directory and give it an installation key of
  "password123"; uses your default Dev Hub org:

    $ sf package version create --path common --installation-key password123

  Create a package version from a package with the specified alias; uses the Dev Hub org with username
  devhub@example.com:

    $ sf package version create --package "Your Package Alias" --installation-key password123 --target-dev-hub \
      devhub@example.com

  Create a package version from a package with the specified ID:

    $ sf package version create --package 0Ho... --installation-key password123

  Create a package version and skip the validation step:

    $ sf package version create --path common --installation-key password123 --skip-validation

FLAG DESCRIPTIONS
  -c, --code-coverage

    Calculate and store the code coverage percentage by running the packaged Apex tests included in this package
    version.

    Before you can promote and release a managed or unlocked package version, the Apex code must meet a minimum 75% code
    coverage requirement. We don’t calculate code coverage for org-dependent unlocked packages or for package versions
    that specify --skip-validation.

  -n, --version-number=<value>

    Version number of the package version to be created; overrides the sfdx-project.json value.

    For information about the format of the version number, see
    https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_dev2gp_config_file.htm.

  -x, --installation-key-bypass

    Bypass the installation key requirement. (either --installation-key or --installation-key-bypass is required)

    If you bypass this requirement, anyone can install your package.

  --language=<value>  Language for the package.

    Specify the language using a language code listed under "Supported Languages" in Salesforce Help. If no language is
    specified, the language defaults to the language of the Dev Hub user who created the package.

  --post-install-script=<value>  Name of the post-install script; applies to managed packages only.

    The post-install script is an Apex class within this package that is run in the installing org after installations
    or upgrades of this package version.

  --post-install-url=<value>  Post-install instructions URL.

    The contents of the post-installation instructions URL are displayed in the UI after installation of the package
    version.

  --releasenotes-url=<value>  Release notes URL.

    This link is displayed in the package installation UI to provide release notes for this package version to
    subscribers.

  --skip-validation  Skip validation during package version creation; you can’t promote unvalidated package versions.

    Skips validation of dependencies, package ancestors, and metadata during package version creation. Skipping
    validation reduces the time it takes to create a new package version, but you can promote only validated package
    versions. Skipping validation can suppress important errors that can surface at a later stage. You can specify skip
    validation or code coverage, but not both. Code coverage is calculated during validation.

  --uninstall-script=<value>  Uninstall script name; applies to managed packages only.

    The uninstall script is an Apex class within this package that is run in the installing org after uninstallations of
    this package.

  --verbose  Display verbose command output.

    Display verbose command output. When polling for the status of the creation, this will output status and timeout
    data on a separate line for each poll request, which is useful in CI systems where timeouts can occur with long
    periods of no output from commands.
```

_See code: [src/commands/package/version/create.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/version/create.ts)_

## `sf package version create list`

List package version creation requests.

```
USAGE
  $ sf package version create list -v <value> [--json] [--flags-dir <value>] [--api-version <value>] [-c <value>] [-s
    Queued|InProgress|Success|Error] [--show-conversions-only] [--verbose]

FLAGS
  -c, --created-last-days=<value>  Number of days since the request was created, starting at 00:00:00 of first day to
                                   now. Use 0 for today.
  -s, --status=<option>            Status of the version creation request, used to filter the list.
                                   <options: Queued|InProgress|Success|Error>
  -v, --target-dev-hub=<value>     (required) Username or alias of the Dev Hub org. Not required if the `target-dev-hub`
                                   configuration variable is already set.
      --api-version=<value>        Override the api version used for api requests made by this command
      --show-conversions-only      Filter the list output to display only converted package version.
      --verbose                    Displays additional information at a slight performance cost, such as the version
                                   name and number for each package version create request.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  List package version creation requests.

  Shows the details of each request to create a package version in the Dev Hub org.

  All filter parameters are applied using the AND logical operator (not OR).

  To get information about a specific request, run "sf package version create report" and supply the request ID.

ALIASES
  $ sf force package version create list

EXAMPLES
  List all package version creation requests in your default Dev Hub org:

    $ sf package version create list

  List package version creation requests from the last 3 days in the Dev Hub org with username devhub@example.com:

    $ sf package version create list --created-last-days 3 --target-dev-hub

  List package version creation requests with status Error:

    $ sf package version create list --status Error

  List package version creation requests with status InProgress:

    $ sf package version create list --status InProgress

  List package version creation requests with status Success that were created today:

    $ sf package version create list --created-last-days 0 --status Success
```

_See code: [src/commands/package/version/create/list.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/version/create/list.ts)_

## `sf package version create report`

Retrieve details about a package version creation request.

```
USAGE
  $ sf package version create report -v <value> -i <value> [--json] [--flags-dir <value>] [--api-version <value>]

FLAGS
  -i, --package-create-request-id=<value>  (required) ID (starts with 08c) of the package version creation request you
                                           want to display.
  -v, --target-dev-hub=<value>             (required) Username or alias of the Dev Hub org. Not required if the
                                           `target-dev-hub` configuration variable is already set.
      --api-version=<value>                Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Retrieve details about a package version creation request.

  Specify the request ID for which you want to view details. If applicable, the command displays errors related to the
  request.

  To show all requests in the org, run "sf package version create list".

ALIASES
  $ sf force package version create report

EXAMPLES
  Retrieve details about the package version creation request with the specified ID; uses your default Dev Hub org:

    $ sf package version create report --package-create-request-id 08c...

  Retrieve details about the specified package version creation request in the Dev Hub org with username
  devhub@example.com:

    $ sf package version create report --package-create-request-id 08c... --target-dev-hub devhub@example.com
```

_See code: [src/commands/package/version/create/report.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/version/create/report.ts)_

## `sf package version delete`

Delete a package version.

```
USAGE
  $ sf package version delete -v <value> -p <value> [--json] [--flags-dir <value>] [--api-version <value>] [-n]

FLAGS
  -n, --no-prompt               Don’t prompt before deleting the package version.
  -p, --package=<value>         (required) ID (starts with 04t) or alias of the package version to delete.
  -v, --target-dev-hub=<value>  (required) Username or alias of the Dev Hub org. Not required if the `target-dev-hub`
                                configuration variable is already set.
      --api-version=<value>     Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Delete a package version.

  Specify the ID or alias of the package version you want to delete.

ALIASES
  $ sf force package version delete

EXAMPLES
  Delete a package version with the specified alias using your default Dev Hub org:

    $ sf package version delete --package "Your Package Alias"

  Delete a package version with the specified ID using the Dev Hub org with username "devhub@example.com":

    $ sf package version delete --package 04t... --target-org devhub@example.com
```

_See code: [src/commands/package/version/delete.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/version/delete.ts)_

## `sf package version displayancestry`

Display the ancestry tree for a 2GP managed package version.

```
USAGE
  $ sf package version displayancestry -v <value> -p <value> [--json] [--flags-dir <value>] [--api-version <value>] [--dot-code]
    [--verbose]

FLAGS
  -p, --package=<value>         (required) ID or alias of the package (starts with 0Ho) or package version (starts with
                                04t) to display ancestry for.
  -v, --target-dev-hub=<value>  (required) Username or alias of the Dev Hub org. Not required if the `target-dev-hub`
                                configuration variable is already set.
      --api-version=<value>     Override the api version used for api requests made by this command
      --dot-code                Display the ancestry tree in DOT code.
      --verbose                 Display both the package version ID (starts with 04t) and the version number
                                (major.minor.patch.build) in the ancestry tree.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

ALIASES
  $ sf force package version displayancestry

EXAMPLES
  Display the ancestry tree for a package version with the specified alias, using your default Dev Hub org:

    $ sf package version displayancestry --package package_version_alias

  Similar to previous example, but display the output in DOT code:

    $ sf package version displayancestry --package package_version_alias --dot-code

  Display the ancestry tree for a package with the specified ID, using the Dev Hub org with username
  devhub@example.com:

    $ sf package version displayancestry --package OHo... --target-dev-hub devhub@example.com

  Display the ancestry tree of a package version with the specified ID, using your default Dev Hub org:

    $ sf package version displayancestry --package 04t...

FLAG DESCRIPTIONS
  -p, --package=<value>

    ID or alias of the package (starts with 0Ho) or package version (starts with 04t) to display ancestry for.

    If you specify a package ID (starts with 0Ho) or alias, the ancestor tree for every package version associated with
    the package ID is displayed. If you specify a package version (starts with 04t) or alias, the ancestry tree of the
    specified package version is displayed.

  --dot-code  Display the ancestry tree in DOT code.

    You can use the DOT code output in graph visualization software to create tree visualizations.
```

_See code: [src/commands/package/version/displayancestry.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/version/displayancestry.ts)_

## `sf package version list`

List all package versions in the Dev Hub org.

```
USAGE
  $ sf package version list -v <value> [--json] [--flags-dir <value>] [--api-version <value>] [-c <value>] [--concise]
    [--show-conversions-only] [-m <value>] [-p <value>] [-r] [-o <value>] [--verbose]

FLAGS
  -c, --created-last-days=<value>   Number of days since the request was created, starting at 00:00:00 of first day to
                                    now. Use 0 for today.
  -m, --modified-last-days=<value>  Number of days since the items were modified, starting at 00:00:00 of first day to
                                    now. Use 0 for today.
  -o, --order-by=<value>            Package version fields used to order the list.
  -p, --packages=<value>            Comma-delimited list of packages (aliases or 0Ho IDs) to list.
  -r, --released                    Display released versions only (IsReleased=true).
  -v, --target-dev-hub=<value>      (required) Username or alias of the Dev Hub org. Not required if the
                                    `target-dev-hub` configuration variable is already set.
      --api-version=<value>         Override the api version used for api requests made by this command
      --concise                     Display limited package version details.
      --show-conversions-only       Filter the list output to display only converted package version.
      --verbose                     Display extended package version details.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  List all package versions in the Dev Hub org.

  Description

ALIASES
  $ sf force package version list

EXAMPLES
  List package versions in your default Dev Hub org that were created in the last 3 days; show only the released
  versions and order the list using the PatchVersion field. Display extended details about each package version:

    $ sf package version list --verbose --created-last-days 3 --released --order-by PatchVersion

  List the released package versions for the two specified packages that were modified today; use the Dev Hub org with
  username devhub@example.com:

    $ sf package version list --packages 0Ho000000000000,0Ho000000000001 --released --modified-last-days 0 \
      --target-dev-hub devhub@example.com

  List all released package versions in your default Dev Hub org:

    $ sf package version list --released

  List package versions that were modified today in your default Dev Hub org; show limited details about each one:

    $ sf package version list --concise --modified-last-days 0

  List released package versions that were created in the last 3 days in your default Dev Hub org; show limited
  details:

    $ sf package version list --concise --created-last-days 3 --released

  List released package versions that were modified today for the two packages with specified aliases in your default
  Dev Hub org:

    $ sf package version list --packages exp-mgr,exp-mgr-util --released --modified-last-days 0
```

_See code: [src/commands/package/version/list.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/version/list.ts)_

## `sf package version promote`

Promote a package version to released.

```
USAGE
  $ sf package version promote -v <value> -p <value> [--json] [--flags-dir <value>] [--api-version <value>] [-n]

FLAGS
  -n, --no-prompt               Don't prompt to confirm setting the package version as released.
  -p, --package=<value>         (required) ID (starts with 04t) or alias of the package version to promote.
  -v, --target-dev-hub=<value>  (required) Username or alias of the Dev Hub org. Not required if the `target-dev-hub`
                                configuration variable is already set.
      --api-version=<value>     Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Promote a package version to released.

  Supply the ID or alias of the package version you want to promote. Promotes the package version to released status.

ALIASES
  $ sf force package version promote

EXAMPLES
  Promote the package version with the specified ID to released; uses your default Dev Hub org:

    $ sf package version promote --package 04t...

  Promote the package version with the specified alias to released; uses the Dev Hub org with username
  devhub@example.com:

    $ sf package version promote --package awesome_package_alias --target-dev-hub devhub@example.com

  Promote the package version with an alias that has spaces to released:

    $ sf package version promote --package "Awesome Package Alias"
```

_See code: [src/commands/package/version/promote.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/version/promote.ts)_

## `sf package version report`

Retrieve details about a package version in the Dev Hub org.

```
USAGE
  $ sf package version report -v <value> -p <value> [--json] [--flags-dir <value>] [--api-version <value>] [--verbose]

FLAGS
  -p, --package=<value>         (required) ID (starts with 04t) or alias of the package to retrieve details for.
  -v, --target-dev-hub=<value>  (required) Username or alias of the Dev Hub org. Not required if the `target-dev-hub`
                                configuration variable is already set.
      --api-version=<value>     Override the api version used for api requests made by this command
      --verbose                 Display extended package version details.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Retrieve details about a package version in the Dev Hub org.

  To update package version values, run "sf package version update".

ALIASES
  $ sf force package version report

EXAMPLES
  Retrieve details about the package version with the specified ID from your default Dev Hub org:

    $ sf package version report --package 04t...

  Retrieve details about the package version with the specified alias (that contains spaces) from the Dev Hub org with
  username devhub@example.com:

    $ sf package version report --package "Your Package Alias" --target-dev-hub devhub@example.com
```

_See code: [src/commands/package/version/report.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/version/report.ts)_

## `sf package version update`

Update a package version.

```
USAGE
  $ sf package version update -v <value> -p <value> [--json] [--flags-dir <value>] [--api-version <value>] [-a <value>] [-e
    <value>] [-b <value>] [-t <value>] [-k <value>]

FLAGS
  -a, --version-name=<value>         New package version name.
  -b, --branch=<value>               New package version branch.
  -e, --version-description=<value>  New package version description.
  -k, --installation-key=<value>     New installation key for key-protected package (default: null)
  -p, --package=<value>              (required) ID (starts with 04t) or alias of the package to update a version of.
  -t, --tag=<value>                  New package version tag.
  -v, --target-dev-hub=<value>       (required) Username or alias of the Dev Hub org. Not required if the
                                     `target-dev-hub` configuration variable is already set.
      --api-version=<value>          Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Update a package version.

  Specify a new value for each option you want to update.

  To display details about a package version, run "sf package version display".

ALIASES
  $ sf force package version update

EXAMPLES
  Update the package version that has the specified alias (that contains spaces) with a new installation key
  "password123"; uses your default Dev Hub org:

    $ sf package version update --package "Your Package Alias" --installation-key password123

  Update the package version that has the specified ID with a new branch and tag; use the Dev Hub org with username
  devhub@example.com:

    $ sf package version update --package 04t... --branch main --tag 'Release 1.0.7' --target-dev-hub \
      devhub@example.com

  Update the package version that has the specified ID with a new description:

    $ sf package version update --package 04t... --version-description "New Package Version Description"
```

_See code: [src/commands/package/version/update.ts](https://github.com/salesforcecli/plugin-packaging/blob/2.3.0/src/commands/package/version/update.ts)_

<!-- commandsstop -->
