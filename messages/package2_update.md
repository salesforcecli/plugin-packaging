# cliDescription

update a second-generation package

# cliLongDescription

Updates a second-generation package.

# help

Specify a new value for each option you want to update.

Run 'sfdx force:package2:list' to list all second-generation packages in the Dev Hub org.

# examples

$ sfdx force:package2:update --package2id 0Ho... --name 'AAnalytics'
$ sfdx force:package2:update -i 0Ho... -d 'Advanced Analytics'

# id

id of the package (starts with 0Ho)

# idLong

ID of package (starts with 0Ho).

# name

package name

# nameLong

Name of the package to update.

# description

package description

# descriptionLong

Description of the package.

# humanSuccess

Successfully updated the package. ID: %s.
