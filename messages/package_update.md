# cliDescription

update package details

# cliLongDescription

Updates details about a package. Does not create a package version.

# help

Specify a new value for each option you want to update.

# examples

$ sfdx force:package:update -p "Your Package Alias" -n "New Package Name"
$ sfdx force:package:update -p 0Ho... -d "New Package Description"

Run "sfdx force:package:list" to list all packages in the Dev Hub org.

# package

ID (starts with 0Ho) or alias of the package to update

# packageLong

The ID (starts with 0Ho) or alias of the package to update.

# name

new package name

# nameLong

New name of the package.

# description

new package description

# descriptionLong

New description of the package.

# humanSuccess

Successfully updated the package.
