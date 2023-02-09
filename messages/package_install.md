# summary

Install a version of a package in the target org.

# description

To install a package, specify a specific version of the package using the 04t package ID. The package and the version you specified installs in your default target org unless you supply the username for a different target org.

For package upgrades, to specify options for component deprecation or deletion of removed components, include an --upgrade-type value. To delete components that can be safely deleted and deprecate the others, specify --upgrade-type Mixed (the default). To deprecate all removed components, specify --upgrade-type DeprecateOnly. To delete all removed components, except for custom objects and custom fields, that don't have dependencies, specify --upgrade-type Delete. (Note: This option can result in the loss of data that is associated with the deleted components.) The default is Mixed.

# examples

- Install a package version with the specified ID in the org with username "me@example.com":

  <%= config.bin %> <%= command.id %> --package 04t... --target-org me@example.com

- Install a package version with the specified alias into your default org:

  <%= config.bin %> <%= command.id %> --package awesome_package_alias

- Install a package version with an alias that includes spaces into your default org:

  <%= config.bin %> <%= command.id %> --package "Awesome Package Alias"

- Install an unlocked package version with the specified ID and deprecate all removed components:

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

Security access type for the installed package. (deprecation notice: The default --security-type value will change from AllUsers to AdminsOnly in v47.0 or later.)

# flags.upgrade-type.summary

Upgrade type for the package installation; available only for unlocked packages.

# flags.upgrade-type.description

For package upgrades, specifies whether to mark all removed components as deprecated (DeprecateOnly), to delete removed components that can be safely deleted and deprecate the others (Mixed), or to delete all removed components, except for custom objects and custom fields, that don't have dependencies (Delete). The default is Mixed. Can specify DeprecateOnly or Delete only for unlocked package upgrades.

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
