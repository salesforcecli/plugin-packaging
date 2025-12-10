# summary

List package bundle installation requests.

# description

Shows the details of each request to install a package bundle version in the target org.

All filter parameters are applied using the AND logical operator (not OR).

To get information about a specific request, run "<%= config.bin %> package bundle install report" and enter the request ID.

# flags.status.summary

Filter the list by the status of the installation request. Valid values are: Queued, Success, and Error.

# flags.verbose.summary

Displays additional information at a slight performance cost. Additional information includes validation text for each package bundle installation request.

# flags.created-last-days.summary

Filter the list by the number of days since the request was created, starting at 0. Use 0 for today.

# examples

- List all package bundle installation requests in your default Dev Hub org:

  <%= config.bin %> <%= command.id %>

- List package bundle installation requests from the last 3 days in the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --created-last-days 3 --target-dev-hub devhub@example.com

- List package bundle installation requests with the Error status:

  <%= config.bin %> <%= command.id %> --status Error

- List package bundle installation requests with the Queued status:

  <%= config.bin %> <%= command.id %> --status Queued

- List package bundle install requests from today with the Success status:

  <%= config.bin %> <%= command.id %> --created-last-days 0 --status Success

# id

ID

# status

Status

# package-bundle-version-id

Package Bundle Version ID

# development-organization

Development Organization

# created-by

Created By

# validation-error

Validation Error
