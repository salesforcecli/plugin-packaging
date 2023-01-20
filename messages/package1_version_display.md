# summary

Display details about a first-generation package version.

# flags.package-version-id.summary

ID (starts with 04t) of the metadata package version whose details you want to display.

# examples

- Display details about the first-generation package version with the specified ID in your default org:

  <%= config.bin %> <%= command.id %> --package-version-id 04t...

- Same as previous example, but use the specified org:

  <%= config.bin %> <%= command.id %> --package-version-id 04t... --target-org myorg@example.com
