# summary

retrieve status of package uninstall request

# examples

$ <%= config.bin %> <%= command.id %> -i 06y...
$ <%= config.bin %> <%= command.id %> -i 06y... -o me@example.com

# request-id

ID of the package uninstall request you want to check

# request-id-long

The ID of the package uninstall request you want to check.

# InProgress

PackageUninstallRequest is currently InProgress. You can continue to query the status using
%s package:uninstall:report -i %s -o %s

# Unknown

TODO: fix me

# Success

Successfully uninstalled package [%s]

# package-id-invalid

Verify that you entered a valid package uninstall request ID (starts with 06y) and try again.
