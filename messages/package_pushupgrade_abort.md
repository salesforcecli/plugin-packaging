# summary

Abort a package push upgrade that has been scheduled. Only push upgrade requests with a status of Created or Pending can be aborted.

# description

Specify the request ID for which you want abort the request. If applicable, the command displays errors related to the request.

To show all requests in the org, run "<%= config.bin %> package pushupgrade list --package 033...".

# examples

- Cancel the specified package push upgrade request with the specified ID; uses your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --push-request-id 0DV...

- Cancel the specified package push upgrade request in the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --push-request-id 0DV... --target-dev-hub devhub@example.com

# flags.push-request-id.summary

ID of the package push request (starts with 0DV). This ID is returned after the package push-upgrade schedule command completes successfully.

# flags.target-dev-hub.summary

Username or alias of the Dev Hub org.

# flags.target-dev-hub.description

Overrides the value of the target-dev-hub configuration variable, if set.

# error.invalid-push-request-id-owner

Can’t abort package push upgrade request. The specified push upgrade ID is associated with a package in a different Dev Hub org. Retry this command in the context of the Dev Hub org that owns the package.

# error.invalid-push-request-id

Can’t abort package push upgrade request. The specified push upgrade ID isn’t valid. Check the ID (starts with 0DV) and retry the command.

# error.invalid-push-request-status

Can’t abort package push upgrade request with status '${pushRequest.Status}'. Only push upgrade requests with a status of 'Created' or 'Pending' can be cancelled.

# status

Status

# output

Scheduled push upgrade ID [%s] was cancelled.
