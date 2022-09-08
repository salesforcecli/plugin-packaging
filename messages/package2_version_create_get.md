# cliDescription

retrieve a package version creation request

# cliLongDescription

Retrieves a second-generation package version creation request in the Dev Hub org.

# help

Specify the request ID for which you want to view details. If applicable, the command displays errors related to the request.

To show all requests in the org, run "sfdx force:package2:version:create:list".

# examples

$ sfdx force:package2:version:create:get --package2createrequestid 08c...

# requestId

package2 version creation request ID (starts with 08c)

# requestIdLong

The ID of the package2 version creation request you want to display.

# error

Error

# truncatedErrors

...

To see all errors, run: sfdx force:data:soql:query -t -q "SELECT Message FROM Package2VersionCreateRequestError WHERE ParentRequest.Id ='%s'"
