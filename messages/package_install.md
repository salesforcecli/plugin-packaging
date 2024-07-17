# summary

Install or upgrade a version of a package in the target org.

# description

To install or upgrade a package, specify a specific version of the package using the 04t package ID. The package and the version you specified installs in your default target org unless you supply the username for a different target org.

When upgrading an unlocked package, include the --upgrade-type value to specify whether any removed components are deprecated or deleted. To delete components that can be safely deleted and deprecate the others, specify "--upgrade-type Mixed" (the default). To deprecate all removed components, specify "--upgrade-type DeprecateOnly". To delete all removed components, except for custom objects and custom fields, that don't have dependencies, specify "--upgrade-type Delete". (Note: This option can result in the loss of data that is associated with the deleted components.)

# examples

- Install or upgrade a package version with the specified ID in the org with username "me@example.com":

  <%= config.bin %> <%= command.id %> --package 04t... --target-org me@example.com

- Install or upgrade a package version with the specified alias into your default org:

  <%= config.bin %> <%= command.id %> --package awesome_package_alias

- Install or upgrade a package version with an alias that includes spaces into your default org:

  <%= config.bin %> <%= command.id %> --package "Awesome Package Alias"

- Upgrade an unlocked package version with the specified ID and deprecate all removed components:

  <%= config.bin %> <%= command.id %> --package 04t... --upgrade-type DeprecateOnly

# flags.wait.summary

Number of minutes to wait for installation status.

# flags.installation-key.summary

Installation key for key-protected package (default: null).

# flags.no-prompt.summary

Don't prompt for confirmation.

# flags.no-prompt.description

Allows the following without an explicit confirmation response: 1) Remote Site Settings and Content Security Policy websites to send or receive data, and 2) --upgrade-type Delete to proceed.

# prompt-upgrade-type

The Delete upgrade type permanently deletes metadata types that have been removed from the package. Deleted metadata can’t be recovered. We don't delete custom objects and custom fields. Instead, we deprecate them.

Do you want to continue? (y/n)

# flags.publish-wait.summary

Maximum number of minutes to wait for the Subscriber Package Version ID to become available in the target org before canceling the install request.

# package-install-success

Successfully installed package [%s]

# flags.package.summary

ID (starts with 04t) or alias of the package version to install.

# flags.security-type.summary

Security access type for the installed package. Available options are AdminsOnly and AllUsers.

# flags.skip-handlers.summary

Skip install handlers (available handlers: FeatureEnforcement).

# flags.skip-handlers.description

Allows the installer of a package to optionally skip install handlers in order to decrease overall installation time (available handlers: FeatureEnforcement).

# flags.upgrade-type.summary

Upgrade type for the package installation; available only for unlocked packages.

# flags.upgrade-type.description

For unlocked package upgrades, set this flag to one of these values:

- DeprecateOnly: Mark all removed components as deprecated.
- Mixed: Delete removed components, except for custom objects and custom fields, that don't have dependencies.
- Delete: Delete all removed components that can be safely deleted, and deprecate the other components.

# flags.apex-compile.summary

Compile all Apex in the org and package, or only Apex in the package; unlocked packages only.

# flags.apex-compile.description

Applies to unlocked packages only. Specifies whether to compile all Apex in the org and package, or only the Apex in the package.

For package installs into production orgs, or any org that has Apex Compile on Deploy enabled, the platform compiles all Apex in the org after the package install or upgrade operation completes.

This approach assures that package installs and upgrades don’t impact the performance of an org, and is done even if --apex-compile package is specified.

# promptEnableRss

This package might send or receive data from these third-party websites:

[%s]

Grant access (y/n)?

# prompt-upgrade-type

The Delete upgrade type permanently deletes metadata types that have been removed from the package. Deleted metadata can’t be recovered. We don't delete custom objects and custom fields. Instead, we deprecate them.

Do you want to continue? (y/n)

# promptUpgradeTypeDeny

We canceled this package installation per your request.

# apiVersionTooLow

This command is supported only on API versions 36.0 and higher

# packageInstallInProgress

PackageInstallRequest is currently InProgress. You can continue to query the status using
%s package:install:report -i %s -o %s

# packageInstallError

Encountered errors installing the package! %s

# packageInstallWaiting

Waiting %s minutes for package install to complete.

# packageInstallWaitingStatus

%d minutes remaining until timeout. Install status: %s

# packagePublishWaitingStatus

%d minutes remaining until timeout. Publish status: %s

# packageInstallPollingTimeout

Polling timeout exceeded

# availableForInstallation

Available for installation

# unavailableForInstallation

Unavailable for installation
