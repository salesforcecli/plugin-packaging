# summary

Install a package bundle version in the target org.

# description

Install a specific version of a package bundle in the target org. During developer preview, bundles can be installed only in scratch orgs.

# examples

Install a package bundle version in a scratch org:

sf package bundle install --bundle MyPkgBundle1@0.1 --target-org my-scratch-org --wait 10

# flags.bundle.summary

Package bundle version to install (format: BundleName@Version).

# flags.target-org.summary

Target org for the bundle installation.

# flags.target-dev-hub.summary

Username, alias, or org ID of the target dev hub org.

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
sf package bundle install:report -i %s -o %s
