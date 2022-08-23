# cliDescription

list all package versions in the Dev Hub org

# cliLongDescription

Lists all package2 versions in the Dev Hub org.

# conciseDescription

display limited package2 version details

# conciseLongDescription

Displays limited package2 version details.

# package2IdsDescription

filter results on specified comma-delimited package2 ids (start with 0Ho)

# package2IdsLongDescription

Filters results on the specified comma-delimited package2 IDs (start with 0Ho).

# releasedDescription

display released versions only

# releasedLongDescription

Displays released versions only (IsReleased=true).

# orderByDescription

order by the specified package2 version fields

# orderByLongDescription

Orders the list by the specified package2 version fields.

# verboseDescription

display extended package2 versions detail

# verboseLongDescription

Display extended package2 versions detail.

# help

Displays details of each package2 version in the org.

Use --concise or --verbose to display limited or additional details, respectively.

All filter parameters are applied using the AND logical operator (not OR).

# examples

$ sfdx force:package2:version:list --verbose --createdlastdays 3 --released --orderby PatchVersion
$ sfdx force:package2:version:list --package2ids 0Ho000000000000,0Ho000000000001 --released --modifiedlastdays 0
$ sfdx force:package2:version:list --released
$ sfdx force:package2:version:list --concise --modifiedlastdays 0
$ sfdx force:package2:version:list --concise -c 3 -r

# name

Name

# description

Description

# version

Version

# id

Package2 Version Id

# subscriberPackageVersionId

Subscriber Package2 Version Id

# package2Id

Package2 Id

# package2Branch

Branch

# package2Tag

Tag

# installUrl

Installation URL
