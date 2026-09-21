# summary

Revoke an accepted Public Secure trust link.

# description

Run this command against a verified packaging org (PBO) to revoke an accepted VerifiedDev trust link. Identify the link with either --request or --authoring-org.

Only Accepted links can be revoked. Pending requests must be denied instead.

# examples

- Revoke an accepted trust link by the request ID returned from package trust link list:

  <%= config.bin %> <%= command.id %> --request 2vtxx0000000001AAA --target-org myPbo

- Revoke an accepted trust link by its authoring org ID:

  <%= config.bin %> <%= command.id %> --authoring-org 00Dxx0000009zZZEAY --target-org myPbo

# flags.request.summary

ID of the accepted trust link to revoke.

# flags.authoring-org.summary

Authoring org ID of the accepted trust link to revoke.

# output

Revoked trust link %s from Authoring Org %s.
