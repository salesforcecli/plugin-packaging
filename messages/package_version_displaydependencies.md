# summary

Display the dependency graph for an unlocked or 2GP managed package version.

# examples

- Display the dependency graph for a package version with the specified alias, using your default Dev Hub org, and the default edge-direction:

  <%= config.bin %> <%= command.id %> --package package_version_alias

- Display the dependency graph for a package version with the specified ID, display the graph using a root-last edge direction. Use the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --package 04t... --edge-direction root-last --target-dev-hub devhub@example.com

- Display the dependency graph of a version create request with the specified ID, using your default Dev Hub org, and the default edge-direction:

  <%= config.bin %> <%= command.id %> --package 08c...

# flags.package.summary

ID or alias of the package version (starts with 04t) or the package version create request (starts with 08c) to display the dependency graph for.

# flags.package.description

Before running this command, update your sfdx-project.json file to specify the calculateTransitiveDependencies attribute, and set the value to true. This command returns GraphViz code, which can be compiled to a graph using DOT code, or another graph visualization software.

# flags.edge-direction.summary

Order (root-first or root-last) in which the dependencies are displayed.

# flags.edge-direction.description

A root-first graph declares the root as the package that must be installed last. A root-last graph is the reverse order of root-first. If you specify --edge-direction=root-last, the graph displays the packages in the order they must be installed. The root starts with the farthest leaf of the package dependencies, and ends with the base package, which must be installed last.

# flags.verbose.summary

Display both the package version ID (starts with 04t) and the version number (major.minor.patch.build) in each node.
