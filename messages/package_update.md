# summary

Update package details.

# description

Specify a new value for each option you want to update.

Run "<%= config.bin %> package list" to list all packages in the Dev Hub org.

# examples

$ <%= config.bin %> <%= command.id %> -p "Your Package Alias" -n "New Package Name"
$ <%= config.bin %> <%= command.id %> -p 0Ho... -d "New Package Description"

# flags.package.summary

ID (starts with 0Ho) or alias of the package to update.

# flags.name.summary

New name of the package.

# flags.description.summary

New description of the package.

# success

Successfully updated the package. %s
