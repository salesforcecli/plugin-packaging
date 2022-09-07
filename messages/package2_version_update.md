# cliDescription

update a second-generation package version

# cliLongDescription

Updates a second-generation package version in the Dev Hub org.

# help

Specify a new value for each option you want to update.

To display details about a package2 version, run "sfdx force:package2:version:get".

# examples

$ sfdx force:package2:version:update --package2versionid 05i... --setasreleased
$ sfdx force:package2:version:update -i 05i... -b master -t 'Release 1.0.7'

# id

the package version ID (starts wtih 05i)

# idLong

The package version ID (starts with 05i).

# name

the package version name

# nameLong

The package version name.

# description

the package version description

# descriptionLong

The second-generation package version description.

# branch

the package version branch

# branchLong

The second-generation package version branch.

# tag

the package version tag

# tagLong

The second-generation package version tag.

# key

installation key for key-protected package (default: null)

# longKey

Installation key for creating the key-protected package. The default is null.

# setasreleased

set the package version as released (can’t be undone)

# setasreleasedLong

Sets the second-generation package version as released. Second-generation packages can’t be changed to beta after they’ve been released.

# setasreleasedForce

no prompt to confirm setting the package version as released

# setasreleasedForceLong

No prompt to confirm setting the package version as released.

# humanSuccess

Successfully updated the package version. ID: %s.

# previousReleased

To release the new package2 version, run "sfdx force:package2:version:update -s <new package2 version ID>".
