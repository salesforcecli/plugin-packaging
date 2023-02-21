# summary

Uninstall a second-generation package from the target org.

# description

Specify the package ID for a second-generation package.

To list the org’s installed packages, run "<%= config.bin %> package installed list".

To uninstall a first-generation package, from Setup, enter Installed Packages in the Quick Find box, then select Installed Packages.

# examples

- Uninstall a package with specified ID from an org with username me@example.com:

  <%= config.bin %> <%= command.id %> --package 04t... --target-org me@example.com

- Uninstall a package with the specified alias from your default org:

  <%= config.bin %> <%= command.id %> --package undesirable_package_alias

- Uninstall a package with an alias that contains spaces from your default org:

  <%= config.bin %> <%= command.id %> --package "Undesirable Package Alias"

# flags.wait.summary

Number of minutes to wait for uninstall status.

# flags.package.summary

ID (starts with 04t) or alias of the package version to uninstall.

# InProgress

PackageUninstallRequest is currently InProgress.
You can continue to query the status using %s package uninstall report -i %s -o %s

# Success

Successfully uninstalled package [%s]
