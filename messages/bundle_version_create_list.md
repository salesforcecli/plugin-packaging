# summary

List package bundle version creation requests.

# description

Shows the details of each request to create a package bundle version in the Dev Hub org.

All filter parameters are applied using the AND logical operator (not OR).

To get information about a specific request, run "<%= config.bin %> package bundle version create report" and supply the request ID.

# flags.status.summary

Status of the version creation request, used to filter the list.

# flags.show-conversions-only.summary

Filter the list output to display only converted package bundle version.

# flags.verbose.summary

Displays additional information at a slight performance cost, such as the version name and number for each package version create request.

# flags.created-last-days.summary

Number of days since the request was created, starting at 00:00:00 of first day to now. Use 0 for today.

# examples

- List all package bundle version creation requests in your default Dev Hub org:

  <%= config.bin %> <%= command.id %>

- List package bundle version creation requests from the last 3 days in the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --created-last-days 3 --target-dev-hub

- List package bundle version creation requests with status Error:

  <%= config.bin %> <%= command.id %> --status Error

- List package bundle version creation requests with status Queued:

  <%= config.bin %> <%= command.id %> --status Queued

- List package bundle version creation requests with status Success that were created today:

  <%= config.bin %> <%= command.id %> --created-last-days 0 --status Success

# id

ID

# status

Status

# package-id

Package Bundle Id

# packageVersionId

Package Bundle Version Id

# createdBy

Created By

# convertedFromVersionId

Converted From Version Id
