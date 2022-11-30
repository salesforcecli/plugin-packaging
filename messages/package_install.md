# cliDescription

install a package in the target org

Supply the ID of the package version to install. The package installs in your default target org unless you supply the username for a different target org.

For package upgrades, to specify options for component deprecation or deletion of removed components, include an --upgradetype value. To delete components that can be safely deleted and deprecate the others, specify --upgradetype Mixed (the default). To deprecate all removed components, specify --upgradetype DeprecateOnly. To delete all removed components, except for custom objects and custom fields, that don't have dependencies, specify --upgradetype Delete. (Note: This option can result in the loss of data that is associated with the deleted components.) The default is Mixed.

# examples

$ sfdx force:package:beta:install --package 04t... -u me@example.com
$ sfdx force:package:beta:install --package awesome_package_alias
$ sfdx force:package:beta:install --package "Awesome Package Alias"
$ sfdx force:package:beta:install --package 04t... -t DeprecateOnly

# wait

number of minutes to wait for installation status

# waitLong

Maximum number of minutes to wait for installation status. The default is 0.

# installationKey

installation key for key-protected package (default: null)

# installationKeyLong

Installation key for installing a key-protected package. The default is null.

# noPrompt

do not prompt for confirmation

# noPromptLong

Allows the following without an explicit confirmation response: 1) Remote Site Settings and Content Security Policy websites to send or receive data, and 2) --upgradetype Delete to proceed.

# promptUpgradeType

The Delete upgrade type permanently deletes metadata types that have been removed from the package. Deleted metadata can’t be recovered. We don't delete custom objects and custom fields. Instead, we deprecate them.

Do you want to continue? (y/n)

# promptUpgradeTypeDeny

We canceled this package installation per your request.

# publishWait

number of minutes to wait for subscriber package version ID to become available in the target org

# publishWaitLong

Maximum number of minutes to wait for the Subscriber Package Version ID to become available in the target org before canceling the install request. The default is 0.

# packageInstallSuccess

Successfully installed package [%s]

# package

ID (starts with 04t) or alias of the package version to install

# packageLong

The ID (starts with 04t) or alias of the package version to install.

# securityType

security access type for the installed package (deprecation notice: The default --securitytype value will change from AllUsers to AdminsOnly in v47.0 or later.)

# securityTypeLong

Security access type for the installed package.

# upgradeType

the upgrade type for the package installation; available only for unlocked packages

# upgradeTypeLong

For package upgrades, specifies whether to mark all removed components as deprecated (DeprecateOnly), to delete removed components that can be safely deleted and deprecate the others (Mixed), or to delete all removed components, except for custom objects and custom fields, that don't have dependencies (Delete). The default is Mixed. Can specify DeprecateOnly or Delete only for unlocked package upgrades.

# apexCompile

compile all Apex in the org and package, or only Apex in the package; unlocked packages only

# apexCompileLong

Applies to unlocked packages only. Specifies whether to compile all Apex in the org and package, or only the Apex in the package.
For package installs into production orgs, or any org that has Apex Compile on Deploy enabled, the platform compiles all Apex in the org after the package install or upgrade operation completes.
This approach assures that package installs and upgrades don’t impact the performance of an org, and is done even if --apexcompile package is specified.

# promptEnableRss

This package might send or receive data from these third-party websites:

[%s]

Grant access (y/n)?

# promptUpgradeType

The Delete upgrade type permanently deletes metadata types that have been removed from the package. Deleted metadata can’t be recovered. We don't delete custom objects and custom fields. Instead, we deprecate them.

Do you want to continue? (y/n)

# promptUpgradeTypeDeny

We canceled this package installation per your request.

# apiVersionTooLow

This command is supported only on API versions 36.0 and higher

# packageInstallInProgress

PackageInstallRequest is currently InProgress. You can continue to query the status using
sfdx force:package:beta:install:report -i %s -u %s

# packageInstallError

Encountered errors installing the package! %s

# packageInstallWaiting

Waiting %s minutes for package install to complete.

# packageInstallWaitingStatus

%d minutes remaining until timeout. Install status: %s

# packagePublishWaitingStatus

%d minutes remaining until timeout. Publish status: %s

# availableForInstallation

Available for installation

# unavailableForInstallation

Unavailable for installation
