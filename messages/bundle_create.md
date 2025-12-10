# summary

Create a package bundle in the Dev Hub org. 

# description

A package bundle is an artifact composed of one or more 2GP managed packages. With a package bundle, you can develop, install, upgrade, and manage multiple packages as a single unit.

# examples

- Create a package bundle in the Dev Hub org; uses the Dev Hub org with the username devhub@example.com:

<%= config.bin %> <%= command.id %> --name "Your bundle name" --description "Your bundle description" --target-dev-hub devhub@example.com

# flags.name.summary

Name of the package bundle.

# flags.description.summary

Description of the package bundle.

# flags.wait.summary

Number of minutes to wait for the package bundle to be created.

# flags.verbose.summary

Display extended details about the package bundle creation.

# requestInProgress

Creating bundle.

# bundleCreateWaitingStatus

%d minutes remaining until timeout. Create bundle status: %s

# bundleCreateFinalStatus

Create bundle status: %s
