# summary

Retrieve the status of a package push upgrade.

# description

Specify the request ID for which you want to view details. If applicable, the command displays errors related to the request.

To show all requests in the org, run "<%= config.bin %> package pushupgrade list".

# examples

- Retrieve details about the package push updgrade with the specified ID; uses your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --push-request-id 0DV...

- Retrieve details about the specified package push request in the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --push-request-id 0DV... --target-dev-hub devhub@example.com

# flags.push-request-id.summary

The ID of the package push request (starts with 0DV). This ID is returned after the package pushupgrade schedule command is run.

# truncatedErrors

To see all errors, run: %s data query -q "SELECT ErrorMessage FROM PackagePushError WHERE PackagePushJob.PackagePushRequestId='%s'"