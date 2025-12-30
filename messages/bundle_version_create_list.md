# summary

List package bundle version creation requests.

# description

Shows the details of each request to create a package bundle version in the Dev Hub org.

All filter parameters are applied using the AND logical operator (not OR).

To get information about a specific request, run "<%= config.bin %> package bundle version create report" and enter the request ID.

# flags.status.summary

Status of the installation request, used to filter the list.

# flags.verbose.summary

Display additional information, such as the version name and number for each package bundle version creation request.

# flags.created-last-days.summary

Number of days since the request was created, starting at 0. Use 0 for today.

# examples

- List all package bundle version creation requests in your default Dev Hub org:

  <%= config.bin %> <%= command.id %>

- List package bundle version creation requests from the last three days in the Dev Hub org with the username devhub@example.com:

  <%= config.bin %> <%= command.id %> --created-last-days 3 --target-dev-hub devhub@example.com

- List package bundle version creation requests with the Error status:

  <%= config.bin %> <%= command.id %> --status Error

- List package bundle version creation requests with the Queued status:

  <%= config.bin %> <%= command.id %> --status Queued

- List package bundle version creation requests from today with the Success status:

  <%= config.bin %> <%= command.id %> --created-last-days 0 --status Success

# id

ID

# status

Status

# package-id

Package Bundle ID

# packageVersionId

Package Bundle Version ID

# createdBy

Created By

# convertedFromVersionId

Converted From Version ID
