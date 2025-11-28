# summary

Create a new package bundle version.

# description

Before you create a new bundle version, create a definition file (similar to a scratch org definition file) that contains the list of package versions to include in the bundle. The definition file must be JSON and you must specify the package versions in the correct order of installation. The package bundle version is based on package versions listed in the definition file. 

After the first bundle version that you create, make sure to update the version number in the sfdx-project.json file for subsequent bundle versions.

To retrieve details about a package bundle version create request, including status and package bundle version ID (04t), run "sf package version create report -i 08c...".

# examples

Create a package bundle version in the Dev Hub org; uses the Dev Hub org with the username devhub@example.com:

sf package bundle version create --bundle “Your bundle name” --definition-file resources/definition.json --target-dev-hub devhub@example.com

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
