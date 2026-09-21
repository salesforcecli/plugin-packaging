# summary

Authorize subscriber orgs to install a package.

# description

Add subscriber org IDs to the authorization list. Optionally specify a package with --package to scope the authorization to that package.

# examples

- Authorize one subscriber org for a package:

  <%= config.bin %> <%= command.id %> --package MyPackage --subscriber-org 00D5e000001CUST --target-org AuthoringOrg

- Authorize multiple subscriber orgs:

  <%= config.bin %> <%= command.id %> --subscriber-org 00D5e000001CUST,00D5e000002CUST

- Authorize the subscriber org IDs in a file:

  <%= config.bin %> <%= command.id %> --subscriber-org-file-list authorized-orgs.txt

# flags.package.summary

Optional ID or alias of the package to authorize.

# flags.subscriber-org.summary

One or more comma-separated subscriber org IDs to authorize.

# flags.subscriber-org-file-list.summary

Path to a file that contains one subscriber org ID per line.

# errorNoSubscriberOrgs

Provide at least one subscriber org ID.

# columns.subscriber-org

Subscriber Org

# columns.id

Authorization ID

# success

Successfully authorized %s subscriber org(s).
