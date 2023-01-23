# summary

Retrieve the status of a package uninstall request.

# examples

- Retrieve the status of a package uninstall in your default org using the specified request ID:

  <%= config.bin %> <%= command.id %> --request-id 06y...

- Similar to previous example, but use the org with username me@example.com:

  <%= config.bin %> <%= command.id %> --request-id 06y... --target-org me@example.com

# flags.request-id.summary

ID of the package uninstall request you want to check; starts with 06y.

# InProgress

PackageUninstallRequest is currently InProgress. You can continue to query the status using
%s package:uninstall:report -i %s -o %s

# Unknown

TODO: fix me

# Success

Successfully uninstalled package [%s]

# package-id-invalid

Verify that you entered a valid package uninstall request ID (starts with 06y) and try again.
