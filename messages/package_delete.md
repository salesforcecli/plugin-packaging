# cliDescription

delete a package

Specify the ID or alias of the package you want to delete.

Delete unlocked and second-generation managed packages. Before you delete a package, first delete all associated package versions.

# examples

$ sfdx force:package:delete -p "Your Package Alias"
$ sfdx force:package:delete -p 0Ho...

# package

ID (starts with 0Ho) or alias of the package to delete

# package-long

The ID (starts with 0Ho) or alias of the package to delete.

# undelete

undelete a deleted package

# undelete-long

Undelete a deleted package.

# no-prompt

don’t prompt before deleting the package

# no-prompt-long

Don’t prompt before deleting the package.

# promptDelete

Deleted packages can’t be recovered.

Do you want to continue? (y/n)

# promptUndelete

This will undelete the package, which may result in unintended consequences for customers. Proceed with caution.

Do you want to continue? (y/n)

# promptDeleteDeny

The request to delete this package was canceled

# humanSuccess

Successfully deleted the package.

# humanSuccessUndelete

Successfully undeleted the package.
