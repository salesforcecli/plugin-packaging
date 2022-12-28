# cliDescription

create a package version

# cliLongDescription

Creates a package version in the Dev Hub org.

The package version is based on the package contents in the specified directory.

To retrieve details about a package version create request, including status and package version ID (04t), run "sfdx force:package:version:create:report -i 08c...".

We recommend that you specify the --installationkey parameter to protect the contents of your package and to prevent unauthorized installation of your package.

To list package version creation requests in the org, run "sfdx force:package:version:create:list".

To promote a package version to released, you must use the --codecoverage parameter. The package must also meet the code coverage requirements. This requirement applies to both managed and unlocked packages.

We don’t calculate code coverage for org-dependent unlocked packages, or for package versions that specify --skipvalidation.

# examples

$ sfdx force:package:version:create -d common -k password123
$ sfdx force:package:version:create -p "Your Package Alias" -k password123
$ sfdx force:package:version:create -p 0Ho... -k password123
$ sfdx force:package:version:create -d common -k password123 --skipvalidation

# package

ID (starts with 0Ho) or alias of the package to create a version of

# package-long

The ID (starts with 0Ho) or alias of the package to create a version of.

# path

path to directory that contains the contents of the package

# path-long

The path to the directory that contains the contents of the package.

# definition-file

path to a definition file similar to scratch org definition file that contains the list of features and org preferences that the metadata of the package version depends on

# definition-file-long

The path to a definition file similar to scratch org definition file that contains the list of features and org preferences that the metadata of the package version depends on.

# branch

the package version’s branch

# branch-long

Name of the branch in your source control system that the package version is based on.

# tag

the package version’s tag

# tag-long

The package version’s tag.

# installation-key

installation key for key-protected package (either --installationkey or --installationkeybypass is required)

# installation-key-long

Installation key for creating the key-protected package. Either an --installationkey value or the --installationkeybypass flag is required.

# installation-key-bypass

bypass the installation key requirement (either --installationkey or --installationkeybypass is required)

# installation-key-bypass-long

Bypasses the installation key requirement. If you bypass this requirement, anyone can install your package. Either an --installationkey value or the --installationkeybypass flag is required.

# preserve

temp files are preserved that would otherwise be deleted

# preserve-long

Specifies that the temp files are preserved that would otherwise be deleted

# validate-schema

sfdx-project.json is validated against JSON schema

# validate-schema-long

Specifies that the sfdx-project.json file should be validated against JSON schema.

# tempFileLocation

The temp files are located at: %s.

# wait

minutes to wait for the package version to be created

# wait-long

The number of minutes to wait for the package version to be created.

# instance

the instance where the package version will be created——for example, NA50

# instance-long

The instance where the package version will be created——for example, NA50.

# version-name

the name of the package version to be created

# version-name-long

The name of the package version to be created. Overrides the sfdx-project.json value.

# version-number

the version number of the package version to be created

# version-number-long

The version number of the package version to be created. Overrides the sfdx-project.json value.

# version-description

the description of the package version to be created

# version-description-long

The description of the package version to be created. Overrides the sfdx-project.json value.

# code-coverage

calculate the code coverage by running the packaged Apex tests

# code-coverage-long

Calculate and store the code coverage percentage by running the Apex tests included in this package version. Before you can promote and release a managed or unlocked package version, the Apex code must meet a minimum 75% code coverage requirement. We don’t calculate code coverage for org-dependent unlocked packages or for package versions that specify --skipvalidation.

# release-notes-url

release notes URL

# release-notes-url-long

The release notes URL. This link is displayed in the package installation UI to provide release notes for this package version to subscribers.

# skip-validation

skip validation during package version creation; you can’t promote unvalidated package versions

# skip-validation-long

Skips validation of dependencies, package ancestors, and metadata during package version creation. Skipping validation reduces the time it takes to create a new package version, but you can promote only validated package versions. Skipping validation can suppress important errors that can surface at a later stage. You can specify skip validation or code coverage, but not both. Code coverage is calculated during validation.

# skip-validation-warning

Skipping validation suppresses errors that usually surface during package version creation. Instead, these errors surface at a later stage, such as installation or post-installation. If you encounter errors that are difficult to debug, retry package version creation without the skipvalidation parameter.

# skip-ancestor-check

Overrides ancestry requirements.

# skip-ancestor-check-long

Override ancestry requirements, which allows you to specify a package ancestor that isn’t the highest released package version.

# post-install-url

post-install URL

# post-install-url-long

The post-install instructions URL. The contents of the post-installation instructions URL are displayed in the UI after installation of the package version.

# post-install-script

post-install script name; managed packages only

# post-install-script-long

Applies to managed packages only. The post-install script name. The post-install script is an Apex class within this package that is run in the installing org after installations or upgrades of this package version.

# uninstall-script

uninstall script name; managed packages only

# uninstall-script-long

Applies to managed packages only. The uninstall script name. The uninstall script is an Apex class within this package that is run in the installing org after uninstallations of this package.

# language

The language for the package.

# language-long

The language for the package. Specify the language using a language code listed under "Supported Languages" in Salesforce Help.

If no language is specified, the language defaults to the language of the Dev Hub user who created the package.

# InProgress

Package version creation request status is '%s'. Run "sfdx force:package:version:create:report -i %s" to query for status.

# Success

Successfully created the package version [%s]. Subscriber Package Version Id: %s
Package Installation URL: %s%s
As an alternative, you can use the "sfdx force:package:install" command.

# errorPathNotFound

The directory [%s] doesn’t exist in the current directory.

# multipleErrors

Multiple errors occurred:

# requestInProgress

Version create.

# packageVersionCreateWaitingStatus

%d minutes remaining until timeout. Create version status: %s

# packageVersionCreateFinalStatus

Create version status: %s
