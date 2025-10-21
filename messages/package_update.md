# summary

Update package details.

# description

Specify a new value for each option you want to update.

Run "<%= config.bin %> package list" to list all packages in the Dev Hub org.

# examples

- Update the name of the package with the specified alias; uses your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --package "Your Package Alias" --name "New Package Name"

- Update the description of the package with the specified ID; uses the specified Dev Hub org:

  <%= config.bin %> <%= command.id %> --package 0Ho... --description "New Package Description" --target-dev-hub devhub@example.com

# flags.package.summary

ID (starts with 0Ho) or alias of the package to update.

# flags.name.summary

New name of the package.

# flags.description.summary

New description of the package.

# flags.enable-app-analytics.summary

Enable AppExchange App Analytics usage data collection on this managed package and its components.

# success

Successfully updated the package. %s

# flags.recommended-version-id.summary

Package version ID that subscribers are notified to install or upgrade to.

# flags.recommended-version-id.description

Specify the recommended package version for subscribers to install. Subscribers are notified to install the package version ID that you specify. If the subscribers have a different version of the same package installed, they're notified to upgrade to the recommended version.

# flags.skip-ancestor-check.summary

Bypass the ancestry check for setting a recommended version.
