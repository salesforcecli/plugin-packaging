# summary

Report on the status of a package bundle installation request.

# description

Use this command to check the status of a package bundle install request. The command returns information about the request, including its current status and details about the package bundle version being installed.

# examples

Report on a package bundle install request:

  <%= config.bin %> <%= command.id %> --package-install-request-id 0Ho0x0000000000000

Report on a package bundle install request using an alias:

  <%= config.bin %> force:package:bundle:install:report -i 0Ho0x0000000000000

# flags.package-install-request-id.summary

ID of the package bundle installation request to report on.

# id

ID

# status

Status

# package-bundle-version-id

Package Bundle Version ID

# development-organization

Development Organization

# validation-error

Validation Error

# created-date

Created Date

# created-by

Created By

# flags.verbose.summary

Show verbose output.
