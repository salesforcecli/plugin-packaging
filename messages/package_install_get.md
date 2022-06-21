# cliDescription

retrieve the status of a package installation request

# cliDescriptionLong

Retrieves the status of a package installation request.

# help

Examples:
$ sfdx force:package:install:get -i 0Hf...
$ sfdx force:package:install:get -i 0Hf... -u me@example.com

# requestId

ID of the package install request you want to check

# requestIdLong

The ID of the package install request you want to check.

# IN_PROGRESS

PackageInstallRequest is currently InProgress. You can continue to query the status using
sfdx force:package:install:get -i %s -u %s

# UNKNOWN

TODO: fix me

# SUCCESS

Successfully installed package [%s]
