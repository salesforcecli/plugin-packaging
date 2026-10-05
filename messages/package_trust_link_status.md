# summary

Display an authoring org's trust link status with a Verified Partner Business Org (PBO).

# description

Reports the current state of the trust link on your connected authoring org: Pending, Approved, Declined, Revoked, Failed, or Not Linked when there’s no link request. The output includes the status and relevant timestamps. To distribute the authoring org’s packages on AgentExchange, an approved trust link with a Verified PBO is required.

Run this command against your connected authoring org, which is either a 1GP namespace org or 2GP Dev Hub. An authoring org holds at most one trust link at a time, so this reports that single link, if any. This command is read-only and makes no changes; it doesn't change any package's distribution type.

# examples

- Show your authoring org’s trust link status:

  <%= config.bin %> <%= command.id %> --target-org myAuthoringOrg

# output.notLinked

This org has no trust link request to a Verified PBO. Its status is Not Linked.

# output.status

Trust link status: %s (Verified PBO %s).

# output.requested

Requested: %s

# output.established

Approved: %s

# output.revoked

Declined or Revoked: %s
