# summary

Approve a request to establish a trust link between an authoring org and a Verified Partner Business Org (PBO).

# description

When a Verified PBO approves a trust link request from an authoring org, the authoring org can distribute packages on AgentExchange.

To approve a trust link request, run this command against a Verified PBO. Identify the request with either --request or --authoring-org.

# examples

- Approve a trust link by the request ID returned from package trust link list:

  <%= config.bin %> <%= command.id %> --request 2vtxx0000000001AAA --target-org myPbo

- Approve a trust link request by its authoring org ID:

  <%= config.bin %> <%= command.id %> --authoring-org 00Dxx0000009zZZEAY --target-org myPbo

# flags.request.summary

ID of the pending trust link request to approve.

# flags.authoring-org.summary

Authoring org ID of the pending trust link request to approve.

# output

Approved trust link request %s from the authoring org %s.
