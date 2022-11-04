# cliDescription

promote a package version to released

Supply the ID or alias of the package version you want to promote. Promotes the package version to released status.

# examples

$ sfdx force:package:version:promote -p 04t...
$ sfdx force:package:version:promote -p awesome_package_alias
$ sfdx force:package:version:promote -p "Awesome Package Alias"

# package

ID (starts with 04t) or alias of the package version to promote

# packageLong

The ID (starts with 04t) or alias of the package version to promote.

# packageVersionPromoteConfirm

Are you sure you want to release package version %s? You can't undo this action. Release package (y/n)?

# setasreleasedForce

no prompt to confirm setting the package version as released

# setasreleasedForceLong

Do not prompt to confirm setting the package version as released.

# humanSuccess

Successfully promoted the package version, ID: %s, to released. Starting in Winter ‘21, only unlocked package versions that have met the minimum 75% code coverage requirement can be promoted. Code coverage minimums aren’t enforced on org-dependent unlocked packages.

# previouslyReleasedMessage

You already promoted a package version with this major.minor.patch version number. For a given major.minor.patch number, you can promote only one version.

# previouslyReleasedAction

Create a new package version with a different --versionumber, then promote the package version.
sfdx force:package:version:create -p <name> -n <versionnum> -k <key>
sfdx force:package:version:promote -p 05ixxx

# hasMetadataRemovedWarning

The package version you've created doesn't contain metadata components that were in the package version's ancestor.
