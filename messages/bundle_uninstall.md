# summary

Uninstall a package bundle version from a target org.

# description

Provide the package bundle version ID or alias and the target org to start an uninstall request. Optionally wait for the uninstall to complete.

# examples

- Uninstall a bundle version by ID from a specified org:

  <%= config.bin %> <%= command.id %> --bundle 1Q8... --target-org me@example.com

- Uninstall a bundle version by alias from your default org and wait up to 10 minutes for completion:

  <%= config.bin %> <%= command.id %> --bundle MyBundle@1.2 -w 10

# flags.bundle.summary

ID (starts with 1Q8) or alias of the package bundle version to uninstall.

# flags.wait.summary

Number of minutes to wait for the uninstall request to complete.

# flags.verbose.summary

Show additional progress while waiting for uninstall to finish.

# bundleUninstallWaitingStatus

Waiting %s more minutes for bundle uninstall. Current status: %s

# bundleUninstallError

Encountered errors uninstalling the bundle! %s

# bundleUninstallInProgress

Bundle uninstall is currently %s. Request Id: %s. Target org: %s

# bundleUninstallSuccess

Successfully uninstalled bundle version %s from %s

