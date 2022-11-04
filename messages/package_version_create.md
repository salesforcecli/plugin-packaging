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

# longPackage

The ID (starts with 0Ho) or alias of the package to create a version of.

# path

path to directory that contains the contents of the package

# longPath

The path to the directory that contains the contents of the package.

# definitionfile

path to a definition file similar to scratch org definition file that contains the list of features and org preferences that the metadata of the package version depends on

# longDefinitionfile

The path to a definition file similar to scratch org definition file that contains the list of features and org preferences that the metadata of the package version depends on.

# branch

the package version’s branch

# longBranch

Name of the branch in your source control system that the package version is based on.

# tag

the package version’s tag

# longTag

The package version’s tag.

# key

installation key for key-protected package (either --installationkey or --installationkeybypass is required)

# longKey

Installation key for creating the key-protected package. Either an --installationkey value or the --installationkeybypass flag is required.

# keyBypass

bypass the installation key requirement (either --installationkey or --installationkeybypass is required)

# longKeyBypass

Bypasses the installation key requirement. If you bypass this requirement, anyone can install your package. Either an --installationkey value or the --installationkeybypass flag is required.

# preserve

temp files are preserved that would otherwise be deleted

# longPreserve

Specifies that the temp files are preserved that would otherwise be deleted

# validateschema

sfdx-project.json is validated against JSON schema

# longValidateschema

Specifies that the sfdx-project.json file should be validated against JSON schema.

# tempFileLocation

The temp files are located at: %s.

# wait

minutes to wait for the package version to be created

# longWait

The number of minutes to wait for the package version to be created.

# instance

the instance where the package version will be created——for example, NA50

# longInstance

The instance where the package version will be created——for example, NA50.

# versionname

the name of the package version to be created

# longVersionname

The name of the package version to be created. Overrides the sfdx-project.json value.

# versionnumber

the version number of the package version to be created

# longVersionnumber

The version number of the package version to be created. Overrides the sfdx-project.json value.

# versiondescription

the description of the package version to be created

# longVersiondescription

The description of the package version to be created. Overrides the sfdx-project.json value.

# codeCoverage

calculate the code coverage by running the packaged Apex tests

# longCodeCoverage

Calculate and store the code coverage percentage by running the Apex tests included in this package version. Before you can promote and release a managed or unlocked package version, the Apex code must meet a minimum 75% code coverage requirement. We don’t calculate code coverage for org-dependent unlocked packages or for package versions that specify --skipvalidation.

# releaseNotesUrl

release notes URL

# releaseNotesUrlLong

The release notes URL. This link is displayed in the package installation UI to provide release notes for this package version to subscribers.

# skipValidation

skip validation during package version creation; you can’t promote unvalidated package versions

# skipValidationLong

Skips validation of dependencies, package ancestors, and metadata during package version creation. Skipping validation reduces the time it takes to create a new package version, but you can promote only validated package versions. Skipping validation can suppress important errors that can surface at a later stage. You can specify skip validation or code coverage, but not both. Code coverage is calculated during validation.

# skipValidationWarning

Skipping validation suppresses errors that usually surface during package version creation. Instead, these errors surface at a later stage, such as installation or post-installation. If you encounter errors that are difficult to debug, retry package version creation without the skipvalidation parameter.

# skipAncestorCheck

Overrides ancestry requirements.

# skipAncestorCheckLong

Override ancestry requirements, which allows you to specify a package ancestor that isn’t the highest released package version.

# postInstallUrl

post-install URL

# postInstallUrlLong

The post-install instructions URL. The contents of the post-installation instructions URL are displayed in the UI after installation of the package version.

# postInstallScript

post-install script name; managed packages only

# postInstallScriptLong

Applies to managed packages only. The post-install script name. The post-install script is an Apex class within this package that is run in the installing org after installations or upgrades of this package version.

# uninstallScript

uninstall script name; managed packages only

# uninstallScriptLong

Applies to managed packages only. The uninstall script name. The uninstall script is an Apex class within this package that is run in the installing org after uninstallations of this package.

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
