# summary

Delete a package bundle.

# description

Specify the ID or alias of the package bundle you want to delete.

Delete package bundles. Before you delete a package bundle, first delete all associated package bundle versions.

# examples

- Delete a package bundle using its alias from your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --bundle "Your Bundle Alias"

- Delete a package bundle using its ID from the specified Dev Hub org:

  <%= config.bin %> <%= command.id %> --bundle 1Fl... --target-dev-hub devhub@example.com

# flags.bundle.summary

ID (starts with 1Fl) or alias of the package bundle to delete.

# flags.undelete.summary

Undelete a deleted package bundle.

# flags.no-prompt.summary

Don't prompt before deleting the package bundle.

# prompt-delete

Deleted package bundles can't be recovered.

Do you want to continue? (y/n)

# prompt-undelete

This will undelete the package bundle, which may result in unintended consequences for customers. Proceed with caution.

Do you want to continue? (y/n)

# prompt-delete-deny

The request to delete this package bundle was canceled

# humanSuccess

Successfully deleted the package bundle %s.

# humanError

Failed to delete the package bundle.
