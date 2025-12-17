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

ID of the package version that's installed when subscribers click the Upgrade to Recommended Version option on the Installed Package page of their org.

# flags.recommended-version-id.description

Specify the recommended package version for subscribers to install. If a subscriber has a package version installed in their org that is lower than the version you set, the subscriber sees the Upgrade to Recommended Version option on the Installed Package page. Only released package versions can be set as the recommended version.


# flags.skip-ancestor-check.summary

Bypass the ancestry check for setting a recommended version.
