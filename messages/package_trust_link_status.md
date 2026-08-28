# summary

Show your authoring org's Public Secure trust link state with a Verified Partner Business Org (PBO).

# description

Reports the current state of the Public Secure (VerifiedDev) trust link on your connected authoring org: Not Linked when no link exists, or one of Pending, Accepted, Declined, Revoked, or Failed when a link does, along with the relevant timestamps.

Run this command against your connected authoring org—the 1GP namespace org or the 2GP Dev Hub. An authoring org holds at most one trust link at a time, so this reports that single link, if any. This command is read-only and makes no changes; it doesn't change any package's distribution type.

# examples

- Show the trust link state on your authoring org:

  <%= config.bin %> <%= command.id %> --target-org myAuthoringOrg

# output.notLinked

This org has no Public Secure trust link. It's Not Linked.

# output.status

Trust link status: %s (Verified Org %s).

# output.requested

Requested: %s

# output.established

Established: %s

# output.revoked

Revoked: %s
