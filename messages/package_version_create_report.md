# cliDescription

retrieve details about a package version creation request

# cliLongDescription

Retrieves details about a package version creation request in the Dev Hub org.

# help

Specify the request ID for which you want to view details. If applicable, the command displays errors related to the request.

# examples

$ sfdx force:package:version:create:report -i 08c...
$ sfdx force:package:version:create:report -i 08c... -v devhub@example.com

To show all requests in the org, run "sfdx force:package:version:create:list".

# requestId

package version creation request ID (starts with 08c)

# requestIdLong

The ID (starts with 08c) of the package version creation request you want to display.

# error

Error

# truncatedErrors

...

To see all errors, run: sfdx force:data:soql:query -t -q "SELECT Message FROM Package2VersionCreateRequestError WHERE ParentRequest.Id ='%s'"
