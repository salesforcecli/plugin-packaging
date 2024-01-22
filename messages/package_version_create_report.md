# summary

Retrieve details about a package version creation request.

# description

Specify the request ID for which you want to view details. If applicable, the command displays errors related to the request.

To show all requests in the org, run "<%= config.bin %> package version create list".

# examples

- Retrieve details about the package version creation request with the specified ID; uses your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --package-create-request-id 08c...

- Retrieve details about the specified package version creation request in the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --package-create-request-id 08c... --target-dev-hub devhub@example.com

# flags.package-create-request-id.summary

ID (starts with 08c) of the package version creation request you want to display.

# truncatedErrors

...

To see all errors, run: %s data query -t -q "SELECT Message FROM Package2VersionCreateRequestError WHERE ParentRequest.Id='%s'" -o %s
