# summary

Retrieve details about a package push request.

# description

Specify the request ID for which you want to view details. If applicable, the command displays errors related to the request.

To show all requests in the org, run "<%= config.bin %> package pushupgrade list".

# examples

- Retrieve details about the package push request with the specified ID; uses your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --package-push-request-id 0DV...

- Retrieve details about the specified package push request in the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --package-push-request-id 0DV... --target-dev-hub devhub@example.com

# flags.package-push-request-id.summary

ID (starts with 0DV) of the package push request you want to display.

# truncatedErrors

To see all errors, run: %s data query -t -q "SELECT Message FROM Package2VersionCreateRequestError WHERE ParentRequest.Id='%s'" -o %s
