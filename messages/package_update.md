# summary

Update package details.

# description

Specify a new value for each option you want to update.

Run "<%= config.bin %> package list" to list all packages in the Dev Hub org.

# examples

- Update the name of the package with the specified alias; uses your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --package "Your Package Alias" --name "New Package Name"

- Update the description of the package with the specified ID; uses the specified Dev Hub org:

  <%= config.bin %> <%= command.id %> --package 0Ho... --description "New Package Description" --target-hub-org devhub@example.com

# flags.package.summary

ID (starts with 0Ho) or alias of the package to update.

# flags.name.summary

New name of the package.

# flags.description.summary

New description of the package.

# success

Successfully updated the package. %s
