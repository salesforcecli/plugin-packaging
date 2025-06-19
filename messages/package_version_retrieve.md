# summary

Retrieve package metadata for a specified package version. Package metadata can be retrieved for converted second-generation managed package versions only.

# description

Retrieving a package version downloads the metadata into the directory you specify.

Specify the subscriber package version ID (starts with 04t) and the path to an empty directory when you run this command.

# examples

- Retrieve package metadata for a converted subscriber package version ID (starts with 04t) into my-folder/ within your Salesforce DX project directory:

  <%= config.bin %> <%= command.id %> --package 04t... --output-dir my-folder –-target-dev-hub my-devhub

# flags.package.summary

Subscriber package version ID (starts with 04t).

# flags.output-dir.summary

Path within your Salesforce DX project directory in which to download the metadata. This directory must be empty.

# headers.fullName

FULL NAME

# headers.type

TYPE

# headers.filePath

PROJECT PATH

# error.failedToDownloadZip

Can’t retrieve package version metadata. Ensure that you've specified the correct 04t ID for the package version and then retry this command.
