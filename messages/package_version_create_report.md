# summary

Retrieve details about a package version creation request.

# description

Specify the request ID for which you want to view details. If applicable, the command displays errors related to the request.

To show all requests in the org, run "<%= config.bin %> package version create list".

# examples

$ <%= config.bin %> <%= command.id %> -i 08c...
$ <%= config.bin %> <%= command.id %> -i 08c... -v devhub@example.com

# flags.package-create-request-id.summary

ID (starts with 08c) of the package version creation request you want to display.

# truncatedErrors

...

To see all errors, run: %s data:soql:query -t -q "SELECT Message FROM Package2VersionCreateRequestError WHERE ParentRequest.Id='%s'" -o %s
