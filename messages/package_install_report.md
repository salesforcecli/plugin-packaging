# summary

Retrieve the status of a package installation request.

# examples

- Retrieve the status of a package installation request with the specified ID on your default org:

  <%= config.bin %> <%= command.id %> --request-id 0Hf...

- Similar to previous example, except use the org with username me@example.com:

  <%= config.bin %> <%= command.id %> --request-id 0Hf... --target-org me@example.com

# flags.request-id.summary

ID of the package install request you want to check; starts with 0Hf.
