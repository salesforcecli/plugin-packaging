# summary

List the org’s installed packages.

# examples

- List the installed packages in your default org:

  <%= config.bin %> <%= command.id %>

- List the installed packages in the org with username me@example.com:

  <%= config.bin %> <%= command.id %> --target-org me@example.com
