# cliDescription

uninstall a second-generation package from the target org

# cliDescriptionLong

Uninstalls a second-generation package from the target org. To uninstall a first-generation package, use the Salesforce user interface.

# help

Specify the package ID for a second-generation package.

Examples:
$ sfdx force:package:uninstall -p 04t... -u me@example.com
$ sfdx force:package:uninstall -p undesirable_package_alias
$ sfdx force:package:uninstall -p "Undesirable Package Alias"

To list the org’s installed packages, run "sfdx force:package:installed:list".

To uninstall a first-generation package, from Setup, enter Installed Packages in the Quick Find box, then select Installed Packages.

# id

ID of the package to uninstall (starts with 04t)

# idLong

The ID of the second-generation package to uninstall (starts with 04t).

# wait

number of minutes to wait for uninstall status

# waitLong

Maximum number of minutes to wait for uninstall status. The default is 0.

# defaultErrorMessage

Can't uninstall the package %s during uninstall request %s.

# humanSuccess

Successfully uninstalled package ID %s.

# action

Verify installed package ID and resolve errors, then try again.

# package

ID (starts with 04t) or alias of the package version to uninstall

# packageLong

The ID (starts with 04t) or alias of the package version to uninstall.

# errorRequiredFlags

Include either a %s value or a %s value.

# invalidIdOrPackage

Invalid alias or ID: %s. Either your alias is invalid or undefined, or the ID provided is invalid.
