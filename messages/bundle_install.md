# summary

Install a package bundle version in the target org.

# description

Install a specific version of a package bundle in the target org. During developer preview, bundles can be installed only in scratch orgs.

# examples

- Install a package bundle version in a scratch org:

  <%= config.bin %> <%= command.id %> --bundle MyPkgBundle1@0.1 --target-org my-scratch-org --dev-hub-org 00Dxx0000000000 --wait 10

- Install using a bundle version ID:

  <%= config.bin %> <%= command.id %> --bundle 1Q8Wt0000000q1pKAA --target-org my-scratch-org --dev-hub-org 00Dxx0000000000 --wait 10

# flags.bundle.summary

Package bundle version to install (format: BundleName@Version or bundle version ID).

# flags.target-org.summary

Target org for the bundle installation.

# flags.dev-hub-org.summary

Org ID of the Dev Hub org where the bundle was created.

# flags.dev-hub-org.description

Specify the dev hub org ID directly (e.g., 00Dxx0000000000). This is the org where the bundle was originally created.

# flags.wait.summary

Number of minutes to wait for the installation to complete.

# flags.verbose.summary

Display extended installation detail.

# requestInProgress

Installing bundle.

# bundleInstallWaitingStatus

%d minutes remaining until timeout. Install status: %s

# bundleInstallFinalStatus

Install status: %s

# bundleInstallSuccess

Successfully installed bundle [%s]

# bundleInstallError

Encountered errors installing the bundle! %s

# bundleInstallInProgress

Bundle installation is currently %s. You can continue to query the status using
sf package bundle install report -i %s -o %s
