# summary

List package versions for the specified first-generation package or for the org.

# flags.package-id.summary

Metadata package ID (starts with 033) whose package versions you want to list.

# flags.package-id.description

If not specified, shows all versions for all packages (managed and unmanaged) in the org.

# examples

- List all first-generation package versions in your default org:

  <%= config.bin %> <%= command.id %>

- List package versions for the specified first-generation package in the specifief org:

  <%= config.bin %> <%= command.id %> --package-id 033... --target-org myorg@example.com
