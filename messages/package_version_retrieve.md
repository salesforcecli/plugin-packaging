# summary

Retrieve package metadata for a specified package version. Package metadata can be retrieved for only second-generation managed package versions or unlocked packages.

# description

Retrieving a package version downloads the metadata into the directory you specify.

When you run this command, specify the subscriber package version ID (starts with 04t) and the path to an empty directory.

By default, the package version retrieve command is available to 2GP managed packages that were converted from 1GP. To use this command with a managed package created using 2GP (not converted from 1GP) or with an unlocked package, specify IsDevUsePkgZipRequested = true in the Package2VersionCreateRequest Tooling API object. If you run this command and the zip folder with the package version’s source files is missing, confirm that IsDevUsePkgZipRequested is set to true.

# examples

- Retrieve package metadata for a converted subscriber package version ID (starts with 04t) into my-directory/ within your Salesforce DX project directory:

  <%= config.bin %> <%= command.id %> --package 04tXXX --output-dir my-directory/ --target-dev-hub devhub@example.com

# flags.package.summary

Subscriber package version ID (starts with 04t).

# flags.output-dir.summary

Path within your Salesforce DX project directory in which to download the metadata. This directory must be empty.

# flags.target-dev-hub.summary

Username or alias of the Dev Hub org. Not required if the `target-dev-hub` configuration variable is already set.

# flags.api-version.summary

Override the API version used for requests made by this command. 

# headers.fullName

FULL NAME

# headers.type

TYPE

# headers.filePath

PROJECT PATH

# error.failedToDownloadZip

Can’t retrieve package version metadata. Ensure that you've specified the correct 04t ID for the package version and then retry this command.
