# summary

Delete a package.

# description

Specify the ID or alias of the package you want to delete.

Delete unlocked and second-generation managed packages. Before you delete a package, first delete all associated package versions.

# examples

- Delete a package using its alias from your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --package "Your Package Alias"

- Delete a package using its ID from the specified Dev Hub org:

  <%= config.bin %> <%= command.id %> --package 0Ho... --target-dev-hub devhub@example.com

# flags.package.summary

ID (starts with 0Ho) or alias of the package to delete.

# flags.undelete.summary

Undelete a deleted package.

# flags.no-prompt.summary

Don’t prompt before deleting the package.

# prompt-delete

Deleted packages can’t be recovered.

Do you want to continue? (y/n)

# prompt-undelete

This will undelete the package, which may result in unintended consequences for customers. Proceed with caution.

Do you want to continue? (y/n)

# prompt-delete-deny

The request to delete this package was canceled

# humanSuccess

Successfully deleted the package.

# humanSuccessUndelete

Successfully undeleted the package.
