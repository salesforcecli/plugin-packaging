# summary

Uninstall a second-generation package from the target org.

# description

Specify the package ID for a second-generation package.

To list the org’s installed packages, run "<%= config.bin %> package installed list".

To uninstall a first-generation package, from Setup, enter Installed Packages in the Quick Find box, then select Installed Packages.

# examples

$ <%= config.bin %> <%= command.id %> -p 04t... -o me@example.com
$ <%= config.bin %> <%= command.id %> -p undesirable_package_alias
$ <%= config.bin %> <%= command.id %> -p "Undesirable Package Alias"

# flags.wait.summary

Number of minutes to wait for uninstall status.

# flags.package.summary

ID (starts with 04t) or alias of the package version to uninstall.

# InProgress

PackageUninstallRequest is currently InProgress.
You can continue to query the status using %s package uninstall report -i %s -o %s

# Success

Successfully uninstalled package [%s]
