# summary

Remove a subscriber org authorization.

# description

Remove one authorization matching the subscriber org ID. Without --package, the command removes the authorization that isn't scoped to a package; specify --package to remove a package-scoped authorization.

# examples

- Remove a subscriber org authorization:

  <%= config.bin %> <%= command.id %> --subscriber-org 00D5e000001CUST --target-org AuthoringOrg

- Remove a subscriber org authorization for a specific package:

  <%= config.bin %> <%= command.id %> --package MyPackage --subscriber-org 00D5e000001CUST --target-org AuthoringOrg

# flags.package.summary

Optional ID or alias of the package used to narrow the authorization record match.

# flags.subscriber-org.summary

Subscriber org ID to remove.

# success

Successfully removed the authorization for subscriber org %s.

# notFound

No authorization for subscriber org %s was found.
