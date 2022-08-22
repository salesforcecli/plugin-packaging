# cliDescription

(deprecated) retrieve the status of a package install request

# cliDescriptionLong

Retrieves the status of a package installion request.

#examples

$ sfdx force:package:install:get -i 0Hf...
$ sfdx force:package:install:get -i 0Hf... -u me@example.com

# requestId

Package Installation Request ID

# requestIdLong

ID of the package install request.

# IN_PROGRESS

The package installation request is still In Progress or Unknown. You can query the status using
$ sfdx force:package:install:get -i %s -u %s

# UNKNOWN

TODO: fix me

# SUCCESS

Successfully installed package [%s].
