# summary

List package push upgrades.

# description

Shows the details of each request to create a push upgrade in the Dev Hub org.

All filter parameters are applied using the AND logical operator (not OR).

To get information about a specific request, run "<%= config.bin %> package pushupgrade report" and supply the request ID.

# flags.package-id.summary

Status of the push upgrade request, used to filter the list.

# flags.scheduled-last-days.summary

Filter the list output to display only push upgrade requests from a specific amount of days.

# flags.status.summary

Status of the push upgrade request, used to filter the list.

# flags.verbose.summary

Displays additional information such as number of orgs scheduled for push upgrade, orgs successfully upgraded, etc.

# examples

- List all package push upgrade requests in your default Dev Hub org:

  <%= config.bin %> <%= command.id %>

- List package push upgrade requests scheduled from the last 3 days in the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --scheduled-last-days 3 --target-dev-hub

- List package push upgrade requests with status Error:

  <%= config.bin %> <%= command.id %> --status Error

- List package push upgrade requests with status Success:

  <%= config.bin %> <%= command.id %> --status Success

# id

ID

# status

Status

# package-id

Package Id

# packageVersionId

Package Version Id
