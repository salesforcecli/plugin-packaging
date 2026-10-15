# summary

Remove a subscriber org’s authorization to install a package with the Limited distribution type.

# description

By default, this command removes the subscriber org’s authorization to install all Limited-distribution packages owned by your org. If the subscriber org’s initial authorization was scoped to a specific package (using the --package flag), then you must use the --package flag to remove the package-scoped authorization.

# examples

- Remove a subscriber org authorization:

  <%= config.bin %> <%= command.id %> --subscriber-org 00D5e000001CUST --target-org AuthoringOrg

- Remove a subscriber org authorization for a specific package:

  <%= config.bin %> <%= command.id %> --package MyPackage --subscriber-org 00D5e000001CUST --target-org AuthoringOrg

# flags.package.summary

Optional ID or alias of the package used to filter the authorization record match.

# flags.subscriber-org.summary

Subscriber org ID to remove from the authorization list.

# success

Successfully removed the authorization for subscriber org %s.

# notFound

No authorization for subscriber org %s was found.
