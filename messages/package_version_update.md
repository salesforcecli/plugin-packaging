# summary

Update a package version.

# description

Specify a new value for each option you want to update.

To display details about a package version, run "<%= config.bin %> package version display".

# examples

- Update the package version that has the specified alias (that contains spaces) with a new installation key "password123"; uses your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --package "Your Package Alias" --installation-key password123

- Update the package version that has the specified ID with a new branch and tag; use the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --package 04t... --branch main --tag 'Release 1.0.7' --target-dev-hub devhub@example.com

- Update the package version that has the specified ID with a new description:

  <%= config.bin %> <%= command.id %> --package 04t... --version-description "New Package Version Description"

# flags.package.summary

ID (starts with 04t) or alias of the package to update a version of.

# flags.version-name.summary

New package version name.

# flags.version-description.summary

New package version description.

# flags.branch.summary

New package version branch.

# flags.tag.summary

New package version tag.

# flags.installation-key.summary

New installation key for key-protected package (default: null)

# success

Successfully updated the package version. %s
