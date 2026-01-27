# summary

Create a new package bundle version.

# description

Create a new version of a package bundle with the specified components.

# examples

Create a new version of a package bundle:

sf package bundle version create -b MyBundle -p path/to/definition.json

# flags.bundle.summary

The name or ID of the package bundle to create a version for.

# flags.definition-file.summary

Path to the JSON file containing the list of components to include in the bundle version.

# flags.wait.summary

Number of minutes to wait for the command to complete before timing out.

# flags.verbose.summary

Show verbose output of the command execution.

# flags.verbose.description

Show detailed information about the bundle version creation process.

# flags.version-number.summary

Version number of the package bundle version to be created; overrides the sfdx-project.json value.

# flags.description.summary

Description of the package bundle version.

# flags.installation-key.summary

Installation key for key-protected bundle.

# bundleVersionCreateWaitingStatus

Waiting for bundle version creation to complete. %s minutes remaining. Current status: %s

# bundleVersionCreateFinalStatus

Package Bundle version creation completed with status: %s

# multipleErrors

The following errors occurred during bundle version creation:
%s

# InProgress

Bundle version creation is %s. Use 'sf package bundle version create report -i %s' to check the status later.

# requestInProgress

Creating bundle version...

# packageVersionCreateFinalStatus

Package Bundle version creation completed with status: %s

# packageVersionCreatePerformingValidations

Performing validations on the package bundle version...

# bundleVersionCreateSuccess

Successfully created bundle version for bundle %s
