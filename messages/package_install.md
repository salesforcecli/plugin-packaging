# cliDescription

install a package in the target org

# cliDescriptionLong

Installs a package in the target org.

# help

Supply the ID of the package version to install. The package installs in your default target org unless you supply the username for a different target org.

For package upgrades, to specify options for component deprecation or deletion of removed components, include an --upgradetype value. To delete components that can be safely deleted and deprecate the others, specify --upgradetype Mixed (the default). To deprecate all removed components, specify --upgradetype DeprecateOnly. To delete all removed components, except for custom objects and custom fields, that don't have dependencies, specify --upgradetype Delete. (Note: This option can result in the loss of data that is associated with the deleted components.) The default is Mixed.

Examples:
$ sfdx force:package:install --package 04t... -u me@example.com
$ sfdx force:package:install --package awesome_package_alias
$ sfdx force:package:install --package "Awesome Package Alias"
$ sfdx force:package:install --package 04t... -t DeprecateOnly

# id

ID of the package version to install (starts with 04t)

# idLong

The ID of the package version to install (starts with 04t).

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

# promptRss

This package might send or receive data from these third-party websites:

%s

Grant access (y\nn)?

# promptUpgradeType

The Delete upgrade type permanently deletes metadata types that have been removed from the package. Deleted metadata can???t be recovered. We don't delete custom objects and custom fields. Instead, we deprecate them.

Do you want to continue? (y\nn)

# promptUpgradeTypeDeny

We canceled this package installation per your request.

# publishWait

number of minutes to wait for subscriber package version ID to become available in the target org

# publishWaitLong

Maximum number of minutes to wait for the Subscriber Package Version ID to become available in the target org before canceling the install request. The default is 0.

# humanSuccess

Successfully installed package ID %s.

# publishWaitProgress

Waiting for the Subscriber Package Version ID to be published to the target org.

# errorApvIdNotPublished

The package version is not fully available. If this is a recently created package version, try again in a few minutes or contact the package publisher.

# package

ID (starts with 04t) or alias of the package version to install

# packageLong

The ID (starts with 04t) or alias of the package version to install.

# securityType

security access type for the installed package (deprecation notice: The default --securitytype value will change from AllUsers to AdminsOnly in v47.0 or later.)

# securityTypeLong

Security access type for the installed package.
Deprecation notice: The --securitytype parameter's default value will change from AllUsers to AdminsOnly in an upcoming release (v47.0 or later).

# upgradeType

the upgrade type for the package installation; available only for unlocked packages

# upgradeTypeLong

For package upgrades, specifies whether to mark all removed components as deprecated (DeprecateOnly), to delete removed components that can be safely deleted and deprecate the others (Mixed), or to delete all removed components, except for custom objects and custom fields, that don't have dependencies (Delete). The default is Mixed. Can specify DeprecateOnly or Delete only for unlocked package upgrades.

# apexCompile

compile all Apex in the org and package, or only Apex in the package; unlocked packages only

# apexCompileLong

Applies to unlocked packages only. Specifies whether to compile all Apex in the org and package, or only the Apex in the package.
For package installs into production orgs, or any org that has Apex Compile on Deploy enabled, the platform compiles all Apex in the org after the package install or upgrade operation completes.
This approach assures that package installs and upgrades don???t impact the performance of an org, and is done even if --apexcompile package is specified.

# errorRequiredFlags

Include either a %s value or a %s value.

# invalidIdOrPackage

Invalid alias or ID: %s. Either your alias is invalid or undefined, or the ID provided is invalid.

# deprecateSecurityTypeDefault

[Deprecation notice: The --securitytype parameter's default value will change from AllUsers to AdminsOnly in an upcoming release (v47.0 or later).]
