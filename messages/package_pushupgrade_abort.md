# summary

Aborts a package push upgrade that has been scheduled. Only push upgrade requests with a Status of Created or Pending can be aborted.

# description

Specify the request ID for which you want abort the request. If applicable, the command displays errors related to the request. Only package push requests in Created or Pending statuses can be aborted.

To show all requests in the org, run "<%= config.bin %> package pushupgrade list --package 033...".

# examples

- Cancel the specified package push upgrade request with the specified ID; uses your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --push-request-id 0DV...

- Cancel the specified package push upgrade request in the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --push-request-id 0DV... --target-dev-hub devhub@example.com

# flags.push-request-id.summary

The ID of the package push request (starts with 0DV). This ID is returned after the package pushupgrade schedule command is run.

# flags.target-dev-hub.summary

Username or alias of the Dev Hub org.

# flags.target-dev-hub.description

Overrides the value of the target-dev-hub configuration variable, if set.

# error.invalid-push-request-id-owner

--push-request-id 0DV... is not owned by the org from where the CLI command is run.

# error.invalid-push-request-id

Package push upgrade request id is invalid. Please use valid ID (starts with 0DV).

# error.invalid-push-request-status

The status of the push request is one of the following: In Progress, Succeeded, Failed, Canceled. Only push requests in Created or Pending statuses can be aborted.

# status

Status

# output

Scheduled push upgrade ID [%s] was cancelled.
