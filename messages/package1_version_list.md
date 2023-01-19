# summary

List package versions for the specified first-generation package or for the org.

# flags.package-id.summary

Metadata package ID (starts with 033) whose package versions you want to list.

# flags.package-id.description

If not specified, shows all versions for all packages (managed and unmanaged) in the org.

# examples

$ <%= config.bin %> <%= command.id %>
$ <%= config.bin %> <%= command.id %> --package 03346000000MrC0XXX
