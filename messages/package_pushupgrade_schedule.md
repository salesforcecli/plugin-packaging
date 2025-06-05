# summary

Schedule a package push upgrade.

# description

Represents a push upgrade request for upgrading a package in one or many orgs from one version to another version.
To initiate a push upgrade for an unlocked or second-generation managed package, the Create and Update Second-Generation Packages user permission is required.
For second-generation managed packages, the push upgrade feature is available only for packages that have passed AppExchange security review. To enable push upgrades for your managed package, log a support case in the Salesforce Partner Community.
For unlocked packages, push upgrades are enabled by default.

Use the -–migrate-to-2GP flag to indicate you’re installing a converted second-generation managed package into an org that has the first-generation managed package version of that package installed.

# flags.target-dev-hub.summary

Username or alias of the Dev Hub org.

# flags.target-dev-hub.description

Overrides the value of the target-dev-hub configuration variable, if set.

# flags.package.summary

ID (starts with 04t) of the package version that the package is being upgraded to. The package version must be an active, non-beta package version.

# flags.start-time.summary

Date and time (UTC) when the push upgrade is processed. Set to the earliest time that you want Salesforce to attempt to start the upgrade.

# flags.start-time.description

Scheduled push upgrades begin as soon as resources are available on the Salesforce instance, which is either at or after the start time you specify. In certain scenarios, the push upgrade starts a few hours after the scheduled start time.

As a best practice, schedule push upgrades at off-peak hours like 1:00 AM Saturday.  
If you don't specify this flag, the push upgrade is scheduled to run as soon as resources are available on the Salesforce instance.

# flags.org-file.summary

Filename of the CSV file that contains the list of orgs that need the package upgrade.

# flags.org-file.description

The file must contain one org per line. The org ID must be the only value in each row. 
All listed orgs must have a package version installed in their org that is lower than the package version you specified for the --package-version flag.

# flags.org-list.summary

Comma-separated list of subscriber org IDs that need the package upgrade.

# flags.migrate-to-2gp.summary

Upgrade from a first-generation managed package (1GP) to a second-generation managed package (2GP). Required when you’re pushing a 2GP package to orgs with the 1GP version installed.

# error.invalid-package-version

Invalid package version.

# error.empty-org-list

Can’t schedule the package push upgrade. The
org file you specified is empty. Review the file you specified, and retry this command.

# error.empty-org-input

There are no org Ids.

# error.invalid-org-file

Can’t schedule the package push upgrade. The org file you specified is invalid. The org file must be a CSV file, and each row can contain only one org ID. Review and update your org file and retry this command.

# error.invalid-org-input

Can’t schedule the package push upgrade. One or more of the orgs IDs you specified in the org list is an invalid org ID. Review the list of orgs you specified, and retry this command

# error.no-org-file-or-org-list-input

Can’t schedule the package push upgrade. You must specify either a list of orgs, or a file containing the list of orgs to be upgraded. Retry this command using either --org-list or --org-file flag and include the required details.

# examples

- Schedule a push upgrade that initiates at a specified time:
  <%= config.bin %> <%= command.id %> --package 04txyz --start-time "2024-12-06T21:00:00" --org-file upgrade-orgs.csv

- Schedule a push upgrade that initiates as soon as possible:
  <%= config.bin %> <%= command.id %> --package 04txyz --org-file upgrade-orgs.csv

- Schedule a push migration from a 1GP package to a 2GP package:
  <%= config.bin %> <%= command.id %> --migrate-to-2gp --package 04txyz --start-time "2024-12-06T21:00:00" --org-file upgrade-orgs.csv --target-dev-hub myHub

# id

ID

# status

Status

# package-id

Package Id

# packageVersionId

Package Version Id

# output

Push upgrade has been scheduled. To check the status of this push upgrade, use push upgrade request ID [%s] with either "package push-upgrade list" or "package push-upgrade report".
Orgs scheduled for push upgrade: {%s}
