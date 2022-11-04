# cliDescription

update a package version

Specify a new value for each option you want to update.

To display details about a package version, run "sfdx force:package:version:report".

# examples

$ sfdx force:package:version:update -p "Your Package Alias" -k password123
$ sfdx force:package:version:update -p 04t... -b main -t 'Release 1.0.7'
$ sfdx force:package:version:update -p 04t... -e "New Package Version Description"

# package

ID (starts with 04t) or alias of the package to update a version of

# packageLong

The ID (starts with 04t) or alias of the package to update a version of.

# name

new package version name

# nameLong

The new package version name.

# description

new package version description

# descriptionLong

The new package version description.

# branch

new package version branch

# branchLong

The new package version branch.

# tag

new package version tag

# tagLong

The new package version tag.

# key

new installation key for key-protected package (default: null)

# longKey

The new installation key for the key-protected package. The default is null.

# success

Successfully updated the package version.
