# cliDescription

retrieve details about a package version creation request

Specify the request ID for which you want to view details. If applicable, the command displays errors related to the request.

To show all requests in the org, run "sfdx force:package:version:create:list".

# examples

$ sfdx force:package:version:create:report -i 08c...
$ sfdx force:package:version:create:report -i 08c... -v devhub@example.com

# requestId

package version creation request ID (starts with 08c)

# requestIdLong

The ID (starts with 08c) of the package version creation request you want to display.

# truncatedErrors

...

To see all errors, run: sfdx force:data:soql:query -t -q "SELECT Message FROM Package2VersionCreateRequestError WHERE ParentRequest.Id='%s'" -u %s
