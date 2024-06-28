# summary

List all package versions in the Dev Hub org.

# description

The command displays details of each package version in the org. Use --concise or --verbose to display limited or additional details, respectively.

All filter parameters are applied using the AND logical operator (not OR).

# flags.concise.summary

Display limited package version details.

# flags.branch.summary

Branch in your source control system used to filter the results; only package versions based on the specified branch are listed.

# flags.packages.summary

Comma-delimited list of packages (aliases or 0Ho IDs) to list.

# flags.released.summary

Display released versions only (IsReleased=true).

# flags.order-by.summary

Package version fields used to order the list.

# flags.verbose.summary

Display extended package version details.

# flags.show-conversions-only.summary

Filter the list output to display only converted package version.

# examples

- List package versions in your default Dev Hub org that were created in the last 3 days; show only the released versions and order the list using the PatchVersion field. Display extended details about each package version:

  <%= config.bin %> <%= command.id %> --verbose --created-last-days 3 --released --order-by PatchVersion

- List the released package versions for the two specified packages that were modified today; use the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --packages 0Ho000000000000,0Ho000000000001 --released --modified-last-days 0 --target-dev-hub devhub@example.com

- List all released package versions in your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --released

- List package versions that were modified today in your default Dev Hub org; show limited details about each one:

  <%= config.bin %> <%= command.id %> --concise --modified-last-days 0

- List package versions that are based on the "featureA" branch in your source control system that were modified today in your default Dev Hub org; show limited details about each one:

  <%= config.bin %> <%= command.id %> --concise --modified-last-days 0 --branch featureA

- List released package versions that were created in the last 3 days in your default Dev Hub org; show limited details:

  <%= config.bin %> <%= command.id %> --concise --created-last-days 3 --released

- List released package versions that were modified today for the two packages with specified aliases in your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --packages exp-mgr,exp-mgr-util --released --modified-last-days 0

# name

Name

# description

Description

# version

Version

# id

Package Version Id

# alias

Alias

# subscriberPackageVersionId

Subscriber Package Version Id

# convertedFromVersionId

Converted From Version Id

# package-id

Package Id

# packageBranch

Branch

# packageTag

Tag

# installUrl

Installation URL

# installKey

Installation Key

# codeCoverage

Code Coverage

# hasPassedCodeCoverageCheck

Code Coverage Met

# validationSkipped

Validation Skipped

# validatedAsync

Validated Async

# releaseVersion

Release Version

# buildDurationInSeconds

Build Duration in Seconds

# hasMetadataRemoved

Managed Metadata Removed

# isOrgDependent

Org-Dependent Unlocked Package

# createdBy

Created By

# language

Language

# endToEndBuildDurationInSeconds

End To End Build Duration In Seconds
