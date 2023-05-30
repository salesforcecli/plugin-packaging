# summary

Download package sources for a previously published package version (1GP or 2GP).

# description

Retrieves sources for a previously published package version (1GP or 2GP) and places them in the specified package directory.

# examples

- Download package sources for a subscriber package id (04t...) into my-folder/ within your sfdx project directory:

  <%= config.bin %> <%= command.id %> --package 04t... --path my-folder

# flags.package.summary

Subscriber package version ID (starts with 04t) of the package version to download.

# flags.outputDir.summary

The path within your SFDX project directory where downloaded sources should be placed. This directory must be new or empty.

# headers.fullName

FULL NAME

# headers.type

TYPE

# headers.filePath

PROJECT PATH

# error.failedToDownloadZip

Failed to download package version metadata.
