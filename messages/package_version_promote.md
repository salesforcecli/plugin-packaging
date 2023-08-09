# summary

Promote a package version to released.

# description

Supply the ID or alias of the package version you want to promote. Promotes the package version to released status.

# examples

- Promote the package version with the specified ID to released; uses your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --package 04t...

- Promote the package version with the specified alias to released; uses the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --package awesome_package_alias --target-dev-hub devhub@example.com

- Promote the package version with an alias that has spaces to released:

  <%= config.bin %> <%= command.id %> --package "Awesome Package Alias"

# flags.package.summary

ID (starts with 04t) or alias of the package version to promote.

# packageVersionPromoteConfirm

Are you sure you want to release package version %s? You can't undo this action. Release package (y/n)?

# promote-deny

Promote operation denied

# flags.no-prompt.summary

Don't prompt to confirm setting the package version as released.

# humanSuccess

Successfully promoted the package version, ID: %s, to released. Starting in Winter ‘21, only unlocked package versions that have met the minimum 75% code coverage requirement can be promoted. Code coverage minimums aren’t enforced on org-dependent unlocked packages.

# previouslyReleasedMessage

You already promoted a package version with this major.minor.patch version number. For a given major.minor.patch number, you can promote only one version.

# previouslyReleasedAction

Create a new package version with a different --version-number, then promote the package version.
%s package:version:create -p <name> -n <versionnum> -k <key>
%s package:version:promote -p 05ixxx

# hasMetadataRemovedWarning

The package version you've created doesn't contain metadata components that were in the package version's ancestor.
