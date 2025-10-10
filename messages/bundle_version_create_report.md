# summary

Report on the status of a package bundle version creation request.

# description

Use this command to check the status of a package bundle version creation request. The command returns information about the request, including its current status and details about the package bundle version being created.

# examples

- Report on a package bundle version creation request:

  <%= config.bin %> <%= command.id %> --package-create-request-id 0Ho0x0000000000000

- Report on a package bundle version creation request using an alias:

  <%= config.bin %> force:package:bundle:version:create:report -i 0Ho0x0000000000000

# flags.bundle-version-create-request-id.summary

The ID of the package bundle version creation request to report on.

# id

ID

# status

Status

# bundle-id

Package Bundle ID

# bundle-version-id

Package Bundle Version ID

# version-name

Version Name

# created-date

Created Date

# created-by

Created By

# validation-error

Validation Error
