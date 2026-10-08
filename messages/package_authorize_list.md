# summary

List records for subscriber orgs that are authorized to install packages with the Limited distribution type.

# description

Display subscriber org authorization records for installing packages with the Limited distribution type. Optionally specify --package to filter the results by package.

# examples

- List all subscriber org authorizations for the example AuthoringOrg:

  <%= config.bin %> <%= command.id %> --target-org AuthoringOrg

- List subscriber org authorizations for a package:

  <%= config.bin %> <%= command.id %> --package MyPackage --target-org AuthoringOrg

# flags.package.summary

Optional ID or alias of the package used to filter the authorization records.

# columns.subscriber-org

Subscriber Org

# columns.subscriber-package

Subscriber Package

# columns.status

Status

# columns.created-date

Authorized Date

# columns.created-by

Authorizing User
