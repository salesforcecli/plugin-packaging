# summary

Retrieve details about a package bundle version in the Dev Hub org.

# description

Use this command to retrieve detailed information about a package bundle version, including its bundle information, version details, and ancestor information if available.

# examples

- Retrieve details about the package bundle version with the specified ID from your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --bundle-version 0Ho0x0000000000000

- Retrieve details about the package bundle version with verbose output:

  <%= config.bin %> <%= command.id %> --bundle-version 0Ho0x0000000000000 --verbose

# flags.bundleVersion.summary

ID of the package bundle version to retrieve details for.

# flags.verbose.summary

Display extended package bundle version details.
