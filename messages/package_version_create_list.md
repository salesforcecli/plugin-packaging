# summary

List package version creation requests.

# description

Shows the details of each request to create a package version in the Dev Hub org.

All filter parameters are applied using the AND logical operator (not OR).

To get information about a specific request, run "<%= config.bin %> package version create report" and supply the request ID.

# flags.status.summary

Status of the version creation request, used to filter the list.

# examples

$ <%= config.bin %> <%= command.id %>
$ <%= config.bin %> <%= command.id %> --created-last-days 3
$ <%= config.bin %> <%= command.id %> --status Error
$ <%= config.bin %> <%= command.id %> -s InProgress
$ <%= config.bin %> <%= command.id %> -c 3 -s Success

# id

ID

# status

Status

# package-id

Package Id

# packageVersionId

Package Version Id

# subscriberPackageVersionId

Subscriber Package Version Id

# branch

Branch

# tag

Tag

# installUrl

Installation URL

# createdBy

Created By
