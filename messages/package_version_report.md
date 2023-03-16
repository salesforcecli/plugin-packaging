# summary

Retrieve details about a package version in the Dev Hub org.

# description

To update package version values, run "<%= config.bin %> package version update".

# examples

- Retrieve details about the package version with the specified ID from your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --package 04t...

- Retrieve details about the package version with the specified alias (that contains spaces) from the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --package "Your Package Alias" --target-dev-hub devhub@example.com

# flags.package.summary

ID (starts with 04t) or alias of the package to retrieve details for.

# flags.verbose.summary

Display extended package version details.

# dependencies

Dependencies

# codeCoveragePercentages

Code Coverage Details

# ancestorId

Ancestor

# ancestorVersion

Ancestor Version

# isReleased

Released
