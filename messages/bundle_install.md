# summary

Install a package bundle version in the target org.

# description

Install a specific version of a package bundle in the target org. During developer preview, bundles can be installed only in scratch orgs. To install a package bundle in a scratch org, add the PackageBundles feature to the scratch org definition file. 

# examples

Install a package bundle version in a scratch org and wait 10 minutes for the installation to complete:

  <%= config.bin %> <%= command.id %> --bundle MyPkgBundle1@0.1 --target-org my-scratch-org --target-dev-hub devhub@example.com --wait 10

# flags.bundle.summary

Package bundle version to install. The valid format is BundleName@VersionNumber, such as `MyPkgBundle@0.1`. 

# flags.target-org.summary

Username or alias of the org in which to install the package bundle version. Not required if the `target-org` configuration variable is already set.

# flags.dev-hub-org.summary

Org ID of the Dev Hub org where the bundle was created.

# flags.dev-hub-org.description

Enter the Dev Hub org ID, such as 00Dxx0000000000. 

# flags.wait.summary

Number of minutes to wait for the installation to complete.

# flags.verbose.summary

Display verbose installation details.

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
