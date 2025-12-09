# summary

List package bundle version creation requests.

# description

Shows the details of each request to create a package bundle version in the Dev Hub org.

All filter parameters are applied using the AND logical operator (not OR).

To get information about a specific request, run "<%= config.bin %> package bundle version create report" and enter the request ID.

# flags.status.summary

Filter the list by the status of the package bundle version create request. Valid values are Queued, Success, or Error. 

# flags.show-conversions-only.summary

Filter the list output to display only converted package bundle version.

# flags.verbose.summary

Displays additional information at a slight performance cost, such as the version name and number for each package version create request.

# flags.created-last-days.summary

Filter the list by the number of days since the request was created, starting at 0. Use 0 for today.

# examples

List all package bundle version create requests in your default Dev Hub org:

  <%= config.bin %> <%= command.id %>

List package bundle version create requests from the last three days in the Dev Hub org with the username devhub@example.com:

  <%= config.bin %> <%= command.id %> --created-last-days 3 --target-dev-hub devhub@example.com

List package bundle version create requests with the Error status:

  <%= config.bin %> <%= command.id %> --status Error

List package bundle version create requests with the Queued status:

  <%= config.bin %> <%= command.id %> --status Queued

List package bundle version create requests from today with the Success status:

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
