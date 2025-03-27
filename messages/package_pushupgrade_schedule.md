# summary

Schedule a package push upgrade.

# description

Represents a push upgrade request for upgrading a package in one or many orgs from one version to another version.
To initiate a push upgrade for an unlocked or second-generation managed package, the Create and Update Second-Generation Packages user permission is required.
For second-generation managed packages, the push upgrade feature is available only for packages that have passed AppExchange security review. To enable push upgrades for your managed package, log a support case in the Salesforce Partner Community.
For unlocked packages, push upgrades are enabled by default.

Use the –migrate-to-2GP flag to indicate you’re installing a converted second-generation managed package into an org that has the first-generation managed package version of that package installed.

# flags.target-dev-hub.summary

Username or alias of the Dev Hub org.

# flags.target-dev-hub.description

Overrides the value of the target-dev-hub configuration variable, if set.

# flags.package.summary

ID (starts with 04t) of the package version that the package is being upgraded to. The package version must be an active, non-beta package version.

# flags.start-time.summary

Date and time (UTC) when the push upgrade is processed. Set to the earliest time that you want Salesforce to attempt to start the upgrade.

# flags.org-file.summary

The filename of the .csv file that contains the list of orgs that need the package upgrade.

# flags.org-list.summary

Comma-separated list of subscriber org IDs that need the package upgrade.

# error.invalid-package-version

Invalid package version.

# error.empty-org-list

Org list file is empty.

# error.empty-org-input

Org list input is empty.

# error.invalid-org-list-file

Org list file is invalid.

# error.invalid-org-input

Org list has invalid org IDs.

# error.no-org-list-file-or-org-list-input

Either org list file or org list input must be supplied.

# examples

- Schedule a push upgrade that initiates at a specified time:
  <%= config.bin %> <%= command.id %> --package 04txyz --start-time "2024-12-06T21:00:00" --org-file upgrade-orgs.csv

- Schedule a push upgrade that initiates as soon as possible:
  <%= config.bin %> <%= command.id %> --package 04txyz --org-file upgrade-orgs.csv

# id

ID

# status

Status

# package-id

Package Id

# packageVersionId

Package Version Id

# output

Push upgrade has been scheduled. To check the status of this push upgrade, use push upgrade request ID [%s] with either “package push-upgrade list” or “package push-upgrade report”.
