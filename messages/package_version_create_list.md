# cliDescription

list package version creation requests

Shows the details of each request to create a package version in the Dev Hub org.

All filter parameters are applied using the AND logical operator (not OR).

To get information about a specific request, run "sfdx force:package:version:create:report" and supply the request ID.

# statusDescription

filter the list by version creation request status

# statusLongDescription

Filters the list based on the status of version creation requests.

# examples

$ sfdx force:package:version:create:list
$ sfdx force:package:version:create:list --createdlastdays 3
$ sfdx force:package:version:create:list --status Error
$ sfdx force:package:version:create:list -s InProgress
$ sfdx force:package:version:create:list -c 3 -s Success

# id

ID

# status

Status

# packageId

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
