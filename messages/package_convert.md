# summary

Create a second-generation package version from a first-generation package.

# description

The package convert creates a new package in the Dev Hub if one does not already exist for the specified first-generation package.

It then creates a new package version in the Dev Hub with contents based on the specified first-generation package.

The latest released non-patch package version from the specified first-generation package will be converted.

To retrieve details about a package version create request, including status and package version ID (04t), run "<%= config.bin %> package version create report -i 08c...".

We recommend specifying the --installation-key to protect the contents of your package and to prevent unauthorized installation of your package.

To list package version creation requests in the org, run "<%= config.bin %> package version create list".

# examples

- Create a second-generation package version from the first-generation package with the specified ID and give it the installation key "password123"; uses your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --package 033... --installation-key password123

- Similar to previous example, but uses the specified Dev Hub org:

  <%= config.bin %> <%= command.id %> --package 033... --installation-key password123 --target-dev-hub devhuborg@example.com

# flags.package.summary

ID (starts with 033) of the first-generation package to convert.

# flags.installation-key.summary

Installation key for key-protected package.

# flags.installation-key.description

Either an --installation-key value or the --installation-key-bypass flag is required.

# flags.installation-key-bypass.summary

Bypass the installation key requirement.

# flags.installation-key-bypass.description

If you bypass this requirement, anyone can install your package. Either an --installation-key value or the --installation-key-bypass flag is required.

# flags.definition-file.summary

Path to a definition file that contains features and org preferences that the metadata of the package version depends on.

# flags.definition-file.description

This definition file is similar to the scratch org definition file.

# flags.wait.summary

Minutes to wait for the package version to be created.

# flags.build-instance.summary

Instance where the conversion package version will be created, such as NA50.

# flags.verbose.summary

Display verbose command output.

# in-progress

Request in progress. Will wait a total of %s more seconds before timing out. Current Status='%s'

# flags.seed-metadata.summary

Directory containing metadata to be deployed prior to conversion.

# flags.seed-metadata.description

The directory containing metadata that will be deployed on the build org prior to attempting conversion.
