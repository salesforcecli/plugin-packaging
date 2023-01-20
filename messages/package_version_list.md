# summary

List all package versions in the Dev Hub org.

# description

The command displays details of each package version in the org. Use --concise or --verbose to display limited or additional details, respectively.

All filter parameters are applied using the AND logical operator (not OR).

# flags.concise.summary

Display limited package version details.

# flags.packages.summary

Comma-delimited list of packages (aliases or 0Ho IDs) to list.

# flags.released.summary

Display released versions only (IsReleased=true).

# flags.order-by.summary

Package version fields used to order the list.

# flags.verbose.summary

Display extended package version details.

# examples

$ <%= config.bin %> <%= command.id %> --verbose --created-last-days 3 --released --order-by PatchVersion
$ <%= config.bin %> <%= command.id %> --packages 0Ho000000000000,0Ho000000000001 --released --modified-last-days 0
$ <%= config.bin %> <%= command.id %> --released
$ <%= config.bin %> <%= command.id %> --concise --modified-last-days 0
$ <%= config.bin %> <%= command.id %> --concise -c 3 -r
$ <%= config.bin %> <%= command.id %> --packages exp-mgr,exp-mgr-util --released --modified-last-days 0

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
