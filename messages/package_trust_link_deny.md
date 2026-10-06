# summary

Deny a Public Secure trust link request.

# description

Run this command against a verified packaging org (PBO) to decline a pending VerifiedDev trust request from an authoring org. Identify the request with either --request or --authoring-org.

A denied request stays on the org as Declined. The authoring org can unlink and request again.

# examples

- Deny a trust request by the request ID returned from package trust link list:

  <%= config.bin %> <%= command.id %> --request 2vtxx0000000001AAA --target-org myPbo

- Deny a trust request by its authoring org ID:

  <%= config.bin %> <%= command.id %> --authoring-org 00Dxx0000009zZZEAY --target-org myPbo

# flags.request.summary

ID of the pending trust link request to deny.

# flags.authoring-org.summary

Authoring org ID of the pending trust link request to deny.

# output

Denied trust link request %s from Authoring Org %s.
