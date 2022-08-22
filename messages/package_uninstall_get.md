# cliDescription

retrieve the status of a package uninstall request

# cliDescriptionLong

Retrieves the status of a package uninstall request.

#examples

$ sfdx force:package:uninstall:get -i 06y...
$ sfdx force:package:uninstall:get -i 06y... -u me@example.com

# requestId

ID of the package uninstall request you want to check

# requestIdLong

The ID of the package uninstall request you want to check.

# InProgress

PackageUninstallRequest is currently InProgress. You can continue to query the status using
sfdx force:package:uninstall:get -i %s -u %s

# Unknown

TODO: fix me

# Success

Successfully uninstalled package [%s]
