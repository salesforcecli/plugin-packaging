# summary

Uninstall a package bundle version from a target org.

# description

To start an uninstall request, provide the package bundle version ID or alias and the target org. Optionally enter the number of minutes to wait for the uninstall to complete. If the time to uninstall exceeds the number of minutes, the request times out.

# examples

- Uninstall a bundle version by ID from the example org myorg@example.com:

  <%= config.bin %> <%= command.id %> --bundle 1Q8... --target-org myorg@example.com

- Uninstall a bundle version by alias from your default org and wait up to 10 minutes to complete:

  <%= config.bin %> <%= command.id %> --bundle MyBundle@1.2 --wait 10

# flags.bundle.summary

ID (starts with 1Q8) or alias of the package bundle version to uninstall.

# flags.wait.summary

Number of minutes to wait for the uninstall request to complete.

# flags.verbose.summary

Show additional progress information while waiting for the uninstall to finish.

# bundleUninstallWaitingStatus

Waiting %s more minutes for the bundle to uninstall. Current status: %s

# bundleUninstallError

Encountered errors uninstalling the bundle! %s

# bundleUninstallInProgress

Bundle uninstall is currently %s. Request Id: %s. Target org: %s

# bundleUninstallSuccess

Successfully uninstalled bundle version %s from %s

