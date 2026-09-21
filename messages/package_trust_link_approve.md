# summary

Approve a Public Secure trust link request.

# description

Run this command against a verified packaging org (PBO) to accept a pending VerifiedDev trust request from an authoring org. Identify the request with either --request or --authoring-org.

# examples

- Approve a trust request by the request ID returned from package trust link list:

  <%= config.bin %> <%= command.id %> --request 2vtxx0000000001AAA --target-org myPbo

- Approve a trust request by its authoring org ID:

  <%= config.bin %> <%= command.id %> --authoring-org 00Dxx0000009zZZEAY --target-org myPbo

# flags.request.summary

ID of the pending trust link request to approve.

# flags.authoring-org.summary

Authoring org ID of the pending trust link request to approve.

# output

Approved trust link request %s from Authoring Org %s.
