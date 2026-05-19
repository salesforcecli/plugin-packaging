# summary

List all installed package bundles in the target org.

# description

Displays information about all package bundles installed in the target org, including the bundle details and the associated packages with their expected and actual versions.

# examples

- List all installed package bundles in your default org:

  <%= config.bin %> <%= command.id %>

- List all installed package bundles in the example org myorg@example.com:

  <%= config.bin %> <%= command.id %> --target-org myorg@example.com

# flags.target-org.summary

The org to list installed package bundles from.
