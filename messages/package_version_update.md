# summary

Update a package version.

# description

Specify a new value for each option you want to update.

To display details about a package version, run "<%= config.bin %> package version display".

# examples

$ <%= config.bin %> <%= command.id %> -p "Your Package Alias" -k password123
$ <%= config.bin %> <%= command.id %> -p 04t... -b main -t 'Release 1.0.7'
$ <%= config.bin %> <%= command.id %> -p 04t... -e "New Package Version Description"

# flags.package.summary

ID (starts with 04t) or alias of the package to update a version of.

# flags.version-name.summary

New package version name.

# flags.version-description.summary

New package version description.

# flags.branch.summary

New package version branch.

# flags.tag.summary

New package version tag.

# flags.installation-key.summary

New installation key for key-protected package (default: null)

# success

Successfully updated the package version.
