# summary

Schedules a package push upgrade request.

# description

Represents a push upgrade request for upgrading a package in one or many orgs from one version to another version.
To initiate a push upgrade for an unlocked or second-generation managed package, the Create and Update Second-Generation Packages user permission is required.
The push upgrade feature is only available second-generation managed packages that have passed AppExchange security review. To enable push upgrades for your managed package, log a support case in the Salesforce Partner Community.
For unlocked packages, push upgrades are enabled by default.

When the –migrate-to-2GP flag is used, this command lets you push a package migration for a first-generation managed package that has been converted to second-generation managed package. This push migration is used to update orgs that have the first-generation managed package installed.

# flags.package-version-id.summary

ID (starts with 04t) of the package version that the package is be upgraded to. The package version must be an active, non-beta package version.

# flags.scheduled-start-time.summary

Specify the date and time (UTC) when the push upgrade is processed. Set this value to the earliest time that you want Salesforce to attempt to start the upgrade.

# flags.org-list.summary

The filename of the .csv file that contains the list of orgs that need the package upgrade.

# error.invalid-package-version

Invalid package version.

# error.empty-org-list

Org list file is empty.

# error.invalid-org-list-file

Org list file is invalid.

# examples

sf package pushupgrade schedule --package-version 04txyz --scheduled-start-time "2024-12-06T21:00:00" --org-list upgrade-orgs.csv --target-dev-hub myHub

sf package pushupgrade schedule --package-version 04txyz --org-list upgrade-orgs.csv --target-dev-hub myHub

sf package pushupgrade schedule --migrate-to-2gp --package-version 04txyz --scheduled-start-time "2024-12-06T21:00:00" --org-list upgrade-orgs.csv --target-dev-hub myHub

# id

ID

# status

Status

# package-id

Package Id

# packageVersionId

Package Version Id
