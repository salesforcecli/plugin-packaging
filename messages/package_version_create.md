# summary

Create a package version in the Dev Hub org.

# description

The package version is based on the package contents in the specified directory.

To retrieve details about a package version create request, including status and package version ID (04t), run "<%= config.bin %> package version create report -i 08c...".

We recommend that you specify the --installation-key parameter to protect the contents of your package and to prevent unauthorized installation of your package.

To list package version creation requests in the org, run "<%= config.bin %> package version create list".
To promote a package version to released, you must use the --code-coverage parameter. The package must also meet the code coverage requirements. This requirement applies to both managed and unlocked packages.

We don’t calculate code coverage for org-dependent unlocked packages, or for package versions that specify --skip-validation.

# examples

- Create a package version from the contents of the "common" directory and give it an installation key of "password123"; uses your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --path common --installation-key password123

- Create a package version from a package with the specified alias; uses the Dev Hub org with username devhub@example.com:

  <%= config.bin %> <%= command.id %> --package "Your Package Alias" --installation-key password123 --target-dev-hub devhub@example.com

- Create a package version from a package with the specified ID:

  <%= config.bin %> <%= command.id %> --package 0Ho... --installation-key password123

- Create a package version and skip the validation step:

  <%= config.bin %> <%= command.id %> --path common --installation-key password123 --skip-validation

- Create a package version and perform package validations asynchronously:

  <%= config.bin %> <%= command.id %> --path common --installation-key password123 --async-validation

# flags.package.summary

ID (starts with 0Ho) or alias of the package to create a version of.

# flags.path.summary

Path to the directory that contains the contents of the package.

# flags.definition-file.summary

Path to a definition file similar to scratch org definition file that contains the list of features and org preferences that the metadata of the package version depends on.

# flags.definition-file.description

For a patch version, the features specified in this file are ignored, and instead the features specified for the ancestor version are used.

# flags.branch.summary

Name of the branch in your source control system that the package version is based on.

# flags.tag.summary

Package version’s tag.

# flags.installation-key.summary

Installation key for key-protected package. (either --installation-key or --installation-key-bypass is required)

# flags.installation-key-bypass.summary

Bypass the installation key requirement. (either --installation-key or --installation-key-bypass is required)

# flags.installation-key-bypass.description

If you bypass this requirement, anyone can install your package.

# flags.preserve.summary

Preserve temp files that would otherwise be deleted.

# flags.validate-schema.summary

Validate the sfdx-project.json file against the JSON schema.

# tempFileLocation

The temp files are located at: %s.

# flags.wait.summary

Number of minutes to wait for the package version to be created.

# flags.build-instance.summary

Instance where the package version will be created, such as NA50.

# flags.version-name.summary

Name of the package version to be created; overrides the sfdx-project.json value.

# flags.version-number.summary

Version number of the package version to be created; overrides the sfdx-project.json value.

# flags.version-number.description

For information about the format of the version number, see https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_dev2gp_config_file.htm.

# flags.version-description.summary

Description of the package version to be created; overrides the sfdx-project.json value.

# flags.code-coverage.summary

Calculate and store the code coverage percentage by running the packaged Apex tests included in this package version.

# flags.code-coverage.description

Before you can promote and release a managed or unlocked package version, the Apex code must meet a minimum 75% code coverage requirement. We don’t calculate code coverage for org-dependent unlocked packages or for package versions that specify --skip-validation.

# flags.releasenotes-url.summary

Release notes URL.

# flags.releasenotes-url.description

This link is displayed in the package installation UI to provide release notes for this package version to subscribers.

# flags.skip-validation.summary

Skip validation during package version creation; you can’t promote unvalidated package versions.

# flags.skip-validation.description

Skips validation of dependencies, package ancestors, and metadata during package version creation. Skipping validation reduces the time it takes to create a new package version, but you can promote only validated package versions. Skipping validation can suppress important errors that can surface at a later stage. You can specify skip validation or code coverage, but not both. Code coverage is calculated during validation.

# skip-validation-warning

Skipping validation suppresses errors that usually surface during package version creation. Instead, these errors surface at a later stage, such as installation or post-installation. If you encounter errors that are difficult to debug, retry package version creation without the --skip-validation parameter.

# flags.async-validation.summary

Return a new package version before completing package validations.

# flags.async-validation.description

Specifying async validation returns the package version earlier in the process, allowing you to install and test the new version right away. If your development team is using continuous integration (CI) scripts, async validation can reduce your overall CI run time.

# flags.skip-ancestor-check.summary

Overrides ancestry requirements, which allows you to specify a package ancestor that isn’t the highest released package version.

# flags.post-install-url.summary

Post-install instructions URL.

# flags.post-install-url.description

The contents of the post-installation instructions URL are displayed in the UI after installation of the package version.

# flags.post-install-script.summary

Name of the post-install script; applies to managed packages only.

# flags.post-install-script.description

The post-install script is an Apex class within this package that is run in the installing org after installations or upgrades of this package version.

# flags.uninstall-script.summary

Uninstall script name; applies to managed packages only.

# flags.uninstall-script.description

The uninstall script is an Apex class within this package that is run in the installing org after uninstallations of this package.

# flags.language.summary

Language for the package.

# flags.language.description

Specify the language using a language code listed under "Supported Languages" in Salesforce Help. If no language is specified, the language defaults to the language of the Dev Hub user who created the package.

# flags.verbose.summary

Display verbose command output.

# flags.verbose.description

Display verbose command output. When polling for the status of the creation, this will output status and timeout data on a separate line for each poll request, which is useful in CI systems where timeouts can occur with long periods of no output from commands.

# InProgress

Package version creation request status is '%s'. Run "%s package:version:create:report -i %s" to query for status.

# Success

Successfully created the package version [%s]. Subscriber Package Version Id: %s
Package Installation URL: %s%s
As an alternative, you can use the "%s package:install" command.

# errorPathNotFound

The directory [%s] doesn’t exist in the current directory.

# multipleErrors

Multiple errors occurred: %s

# requestInProgress

Version create.

# packageVersionCreateWaitingStatus

%d minutes remaining until timeout. Create version status: %s

# packageVersionCreatePerformingValidations

The validations for this package version are in progress, but you can now begin testing this package version.
To determine whether all package validations complete successfully, run "sf package version create report --package-create-request-id 08cxx" and review the Status.
Async validated package versions can be promoted only if all validations complete successfully.

# packageVersionCreateFinalStatus

Create version status: %s

# unknownError

An unknown error occurred.
