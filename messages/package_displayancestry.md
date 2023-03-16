# summary

Display the ancestry tree for a 2GP managed package version.

# examples

- Display the ancestry tree for a package version with the specified alias, using your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --package package_version_alias

- Similar to previous example, but display the output in DOT code:

  <%= config.bin %> <%= command.id %> --package package_version_alias --dot-code

- Display the ancestry tree for a package with the specified ID, using the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --package OHo... --target-dev-hub devhub@example.com

- Display the ancestry tree of a package version with the specified ID, using your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --package 04t...

# flags.package.summary

ID or alias of the package (starts with 0Ho) or package version (starts with 04t) to display ancestry for.

# flags.package.description

If you specify a package ID (starts with 0Ho) or alias, the ancestor tree for every package version associated with the package ID is displayed. If you specify a package version (starts with 04t) or alias, the ancestry tree of the specified package version is displayed.

# flags.dot-code.summary

Display the ancestry tree in DOT code.

# flags.dot-code.description

You can use the DOT code output in graph visualization software to create tree visualizations.

# flags.verbose.summary

Display both the package version ID (starts with 04t) and the version number (major.minor.patch.build) in the ancestry tree.
