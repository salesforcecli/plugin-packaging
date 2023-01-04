# summary

uninstall a second-generation package from the target org

Specify the package ID for a second-generation package.

To list the org’s installed packages, run "sfdx force:package:installed:list".

To uninstall a first-generation package, from Setup, enter Installed Packages in the Quick Find box, then select Installed Packages.

# examples

$ sfdx force:package:uninstall -p 04t... -u me@example.com
$ sfdx force:package:uninstall -p undesirable_package_alias
$ sfdx force:package:uninstall -p "Undesirable Package Alias"

# wait

number of minutes to wait for uninstall status

# wait-long

Maximum number of minutes to wait for uninstall status. The default is 0.

# package

ID (starts with 04t) or alias of the package version to uninstall

# package-long

The ID (starts with 04t) or alias of the package version to uninstall.

# InProgress

PackageUninstallRequest is currently InProgress.
You can continue to query the status using sfdx force:package:uninstall:report -i %s -u %s

# Success

Successfully uninstalled package [%s]
