# summary

update a package version

Specify a new value for each option you want to update.

To display details about a package version, run "<%= config.bin %> package:version:display".

# examples

$ <%= config.bin %> <%= command.id %> -p "Your Package Alias" -k password123
$ <%= config.bin %> <%= command.id %> -p 04t... -b main -t 'Release 1.0.7'
$ <%= config.bin %> <%= command.id %> -p 04t... -e "New Package Version Description"

# package

ID (starts with 04t) or alias of the package to update a version of

# package-long

The ID (starts with 04t) or alias of the package to update a version of.

# version-name

new package version name

# version-name-long

The new package version name.

# version-description

new package version description

# version-description-long

The new package version description.

# branch

new package version branch

# branchLong

The new package version branch.

# tag

new package version tag

# tagLong

The new package version tag.

# installation-key

new installation key for key-protected package (default: null)

# installation-key-long

The new installation key for the key-protected package. The default is null.

# success

Successfully updated the package version.
