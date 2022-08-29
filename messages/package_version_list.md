# cliDescription

list all package versions in the Dev Hub org.

Displays details of each package version in the org.

Use --concise or --verbose to display limited or additional details, respectively.

All filter parameters are applied using the AND logical operator (not OR).

# conciseDescription

display limited package version details

# conciseLongDescription

Displays limited package version details.

# packagesDescription

filter results on specified comma-delimited packages (aliases or 0Ho IDs)

# packagesLongDescription

Filters results on the specified comma-delimited packages (aliases or 0Ho IDs).

# releasedDescription

display released versions only

# releasedLongDescription

Displays released versions only (IsReleased=true).

# orderByDescription

order by the specified package version fields

# orderByLongDescription

Orders the list by the specified package version fields.

# verboseDescription

display extended package version details

# verboseLongDescription

Displays extended package version details.

# examples

$ sfdx force:package:version:list --verbose --createdlastdays 3 --released --orderby PatchVersion
$ sfdx force:package:version:list --packages 0Ho000000000000,0Ho000000000001 --released --modifiedlastdays 0
$ sfdx force:package:version:list --released
$ sfdx force:package:version:list --concise --modifiedlastdays 0
$ sfdx force:package:version:list --concise -c 3 -r
$ sfdx force:package:version:list --packages exp-mgr,exp-mgr-util --released --modifiedlastdays 0

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

# packageId

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
