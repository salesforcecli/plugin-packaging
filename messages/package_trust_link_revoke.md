# summary

Revoke a previously approved trust link between an authoring org and a Verified Partner Business Org (PBO).

# description

Run this command against a Verified PBO to revoke a previously approved trust link from an authoring org. Identify the link with either --request or --authoring-org. Revoking a trust link prevents the authoring org from continuing to distribute packages on AgentExchange.

Only Approved links can be revoked. Pending requests must be denied instead.

# examples

- Revoke an approved trust link by the request ID returned from package trust link list:

  <%= config.bin %> <%= command.id %> --request 2vtxx0000000001AAA --target-org myPbo

- Revoke an approved trust link by its authoring org ID:

  <%= config.bin %> <%= command.id %> --authoring-org 00Dxx0000009zZZEAY --target-org myPbo

# flags.request.summary

ID of the approved trust link to revoke.

# flags.authoring-org.summary

Authoring org ID of the approved trust link to revoke.

# output

Revoked trust link %s from authoring org %s.
