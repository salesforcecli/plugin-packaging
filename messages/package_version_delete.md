# summary

Delete a package version.

# description

Specify the ID or alias of the package version you want to delete.

# examples

- Delete a package version with the specified alias using your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --package "Your Package Alias"

- Delete a package version with the specified ID using the Dev Hub org with username "devhub@example.com":

  <%= config.bin %> <%= command.id %> --package 04t... --target-org devhub@example.com

# flags.package.summary

ID (starts with 04t) or alias of the package version to delete.

# flags.undelete.summary

Undelete a deleted package version.

# flags.no-prompt.summary

Don’t prompt before deleting the package version.

# prompt-delete

Deleted package versions can’t be recovered.

Do you want to continue? (y/n)

# prompt-undelete

This will undelete the package version, which may result in unintended consequences for customers. Proceed with caution.

Do you want to continue? (y/n)

# prompt-delete-deny

The request to delete this package version has been canceled.

# humanSuccess

Successfully deleted the package version.

# humanSuccessUndelete

Successfully undeleted the package version.
