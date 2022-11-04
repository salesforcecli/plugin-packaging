# cliDescription

delete a package version
Specify the ID or alias of the package version you want to delete.

# examples

$ sfdx force:package:version:delete -p "Your Package Alias"
$ sfdx force:package:version:delete -p 04t...

# package

ID (starts with 04t) or alias of the package to update a version of

# packageLong

The ID (starts with 04t) or alias of the package version to delete.

# undelete

undelete a deleted package version

# undeleteLong

Undelete a deleted package version.

# noPrompt

don’t prompt before deleting the package version

# promptDelete

Deleted package versions can’t be recovered.

Do you want to continue? (y/n)

# promptUndelete

This will undelete the package version, which may result in unintended consequences for customers. Proceed with caution.

Do you want to continue? (y/n)

# promptDeleteDeny

The request to delete this package version has been canceled.

# humanSuccess

Successfully deleted the package version.

# humanSuccessUndelete

Successfully undeleted the package version.
