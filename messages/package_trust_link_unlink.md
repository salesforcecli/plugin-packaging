# summary

Remove your authoring org's trust link to a Verified Partner Business Org (PBO).

# description

Clears the trust link from your connected authoring org, returning it to the Not Linked state. An authoring org can hold only one trust link at a time, so this removes any link that exists, in any state.

Run this command against your connected authoring org, which is either a 1GP namespace org or 2GP Dev Hub. You can use this command to abandon a pending request. After a request is declined, you can also use this command to clear the link before requesting a new one. If the org has no trust link, the command reports that it's already Not Linked and makes no changes.

# examples

- Remove the trust link from your authoring org:

  <%= config.bin %> <%= command.id %> --target-org myAuthoringOrg

# output.removed

Removed the trust link to Verified PBO %s (was %s). This org is now Not Linked.

# output.notLinked

This org has no trust link to remove; it's already Not Linked.
