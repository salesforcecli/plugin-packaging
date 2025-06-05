# summary

Lists the status of push upgrade requests for a given package.

# description

Shows the details of each request to create a push upgrade in the Dev Hub org.

All filter parameters are applied using the AND logical operator (not OR).

To get information about a specific request, run "sf package pushupgrade report" and supply the request ID.

# flags.package.summary

Package ID (starts with 033) of the package that you want push upgrade information for.

# flags.scheduled-last-days.summary

Number of days in the past for which to display the list of push upgrade requests that were scheduled. Used to filter the list output to only recently scheduled push upgrades.

# flags.status.summary

Status used to filter the list output Valid values are: Created, Canceled, Pending, In Progress, Failed, or Succeeded

# flags.show-push-migrations-only.summary

Display only push upgrade requests for package migrations.

# examples

- List all package push upgrade requests in the specified Dev Hub org:

  <%= config.bin %> <%= command.id %> --package 033xyz --target-dev-hub myHub

- List all package push upgrade requests in the specified Dev Hub org scheduled in the last 30 days:

  <%= config.bin %> <%= command.id %> --package 033xyz --scheduled-last-days 30 --target-dev-hub myHub

- List all package push upgrade with a status Succeeded:

  <%= config.bin %> <%= command.id %> --package 033xyz –-status Succeeded

- List all package push upgrade with a status Failed:

  <%= config.bin %> <%= command.id %> --package 033xyz –-status Failed

# id

ID

# status

Status

# package-id

Package Id

# packageVersionId

Package Version Id
