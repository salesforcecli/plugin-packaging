# cliDescription

list package version creation requests

# cliLongDescription

Lists all requests to create second-generation package (package2) versions in the Dev Hub org.

# statusDescription

filter the list by version creation request status

# statusLongDescription

Filters the list based on the status of version creation requests.

# help

Shows the details of each request to create a package2 version that's run in the Dev Hub org.

All filter parameters are applied using the AND logical operator (not OR).

To get information about a specific request, run "sfdx force:package2:version:create:get" and supply the request ID.

# examples

$ sfdx force:package2:version:create:list
$ sfdx force:package2:version:create:list --createdlastdays 3
$ sfdx force:package2:version:create:list --status Error
$ sfdx force:package2:version:create:list -s InProgress
$ sfdx force:package2:version:create:list -c 3 -s Success

# id

ID

# status

Status

# package2Id

Package2 Id

# package2VersionId

Package2 Version Id

# subscriberPackageVersionId

Subscriber Package2 Version Id

# branch

Branch

# tag

Tag

# installUrl

Installation URL
