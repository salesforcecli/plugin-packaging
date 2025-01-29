# summary

Lists the status of push upgrade requests for a given package.

# description

Shows the details of each request to create a push upgrade in the Dev Hub org.

All filter parameters are applied using the AND logical operator (not OR).

To get information about a specific request, run "sf package pushupgrade report" and supply the request ID.

# flags.package-id.summary

Specify the package ID (starts with 033) of the package that you want push upgrade information for.

# flags.scheduled-last-days.summary

Filter the list output to only display push upgrades scheduled in the last few days. For example, if this flag is set to 30, only push upgrade requests scheduled for the last 30 days are listed in the output.

# flags.status.summary

Filter the list output by one of the following statuses: Created, Canceled, Pending, In Progress, Failed, or Succeeded

# flags.verbose.summary

Displays additional information such as number of orgs scheduled for push upgrade, orgs successfully upgraded, etc.

# examples

- List all package push upgrade requests in the specified Dev Hub org:

  sf package pushupgrade list --package 033xyz --target-dev-hub myHub

- List all package push upgrade requests in the specified Dev Hub org scheduled in the last 30 days:

  sf package pushupgrade list --package 033xyz --scheduled-last-days 30 --target-dev-hub myHub

- List all package push upgrade with a status Succeeded:

  sf package pushupgrade list --package 033xyz –-Status=Succeeded

# id

ID

# status

Status

# package-id

Package Id

# packageVersionId

Package Version Id
