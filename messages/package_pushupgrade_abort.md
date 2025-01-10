# summary

Abort the package push upgrade request.

# description

Specify the request ID for which you want abort the request. If applicable, the command displays errors related to the request. Only package push requests in Created or Pending statuses can be aborted.

To show all requests in the org, run "<%= config.bin %> package pushupgrade list".

# examples

- Cancel the specified package push upgrade request with the specified ID; uses your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --package-push-request-id 0DV...

- Cancel the specified package push upgrade request in the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --package-push-request-id 0DV... --target-dev-hub devhub@example.com

# flags.package-push-request-id.summary

ID (starts with 0DV) of the package push request you want to cancel. This is the id that is returned when the push upgrade is scheduled.

# error.invalid-package-push-request-id-owner

--package-push-request-id 0DV... is not owned by the org from where the CLI command is run.

# error.invalid-package-push-request-id

Package push upgrade request id is invalid. Please use valid ID (starts with 0DV).

# error.invalid-package-push-request-status

The status of the push request is one of the following: In Progress, Succeeded, Failed, Canceled. Only push requests in Created or Pending statuses can be aborted.

# status

Status