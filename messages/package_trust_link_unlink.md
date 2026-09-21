# summary

Remove your authoring org's trust link to a Verified Partner Business Org (PBO).

# description

Clears the Public Secure (VerifiedDev) trust link on your connected authoring org, returning it to the Not Linked state. An authoring org can hold only one trust link at a time, so this removes whichever link exists, in any state.

Run this command against your connected authoring org—the 1GP namespace org or the 2GP Dev Hub. Use it to abandon a pending request or, after a request is declined, to clear the link before requesting a new one. If the org has no trust link, the command reports that it's already Not Linked and makes no changes.

# examples

- Remove the trust link on your authoring org:

  <%= config.bin %> <%= command.id %> --target-org myAuthoringOrg

# output.removed

Removed the trust link to Verified Org %s (was %s). This org is now Not Linked.

# output.notLinked

This org has no trust link to remove; it's already Not Linked.
