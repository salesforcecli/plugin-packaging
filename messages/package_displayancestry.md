# summary

Display the ancestry tree for a 2GP managed package version.

# examples

$ <%= config.bin %> <%= command.id %> -p package_version_alias
$ <%= config.bin %> <%= command.id %> -p package_version_alias --dot-code
$ <%= config.bin %> <%= command.id %> -p OHo...
$ <%= config.bin %> <%= command.id %> -p 04t...

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
