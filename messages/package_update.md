# cliDescription

update package details

Specify a new value for each option you want to update.

Run "sfdx force:package:list" to list all packages in the Dev Hub org.

# examples

$ sfdx force:package:update -p "Your Package Alias" -n "New Package Name"
$ sfdx force:package:update -p 0Ho... -d "New Package Description"

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

# success

Successfully updated the package. %s
