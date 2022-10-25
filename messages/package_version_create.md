# cliDescription

create a package version

# cliLongDescription

Creates a package version in the Dev Hub org.

# help

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

# dir

path to directory that contains the contents of the package version

# longDir

The path to the directory that contains the contents of the package version.

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

# sourceorg

the source org ID used to copy the org shape for the build org

# longSourceorg

The source org ID used to copy the org shape for the build org.

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

# hasMetadataRemovedWarning

The package version you've created doesn't contain metadata components that were in the package version's ancestor.

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

# defaultVersionName

versionName is blank in sfdx-project.json, so it will be set to this default value based on the versionNumber: %s

# buildNumberResolvedForLatest

Dependency on package %s was resolved to version number %s, branch %s, %s.

# buildNumberResolvedForReleased

Dependency on package %s was resolved to the released version number %s, %s.

# InProgress

Package version creation request status is '%s'. Run "sfdx force:package:version:create:report -i %s" to query for status.

# Success

Successfully created the package version [%s]. Subscriber Package Version Id: %s
Package Installation URL: %s%s
As an alternative, you can use the "sfdx force:package:install" command.

# errorMissingFlags

Include either a %s value or a %s value. The value must match one of the packageDirectories specified in sfdx-project.json.

# errorCannotSupplyCodeCoverageAndSkipValidation

We couldn’t create this package version because both %s and %s parameters were specified. Code coverage can’t be calculated when validation is skipped. Specify either %s or %s and try again.

# errorMissingFlagsInstallationKey

A required parameter is missing. Include either an %s value or %s.

# errorNoMatchingPackageDirectory

The %s value [%s], doesn’t match the %s value in any packageDirectories specified in sfdx-project.json.

# errorDirectoryIdMismatch

The %s value, [%s], and %s value, [%s], were both found in sfdx-project.json but don’t match. If you supply both values, they must match the path and package values in one of the packageDirectories.

# errorDependencyPair

Dependency must specify either a subscriberPackageVersionId or both packageId and versionNumber: %s.

# errorNoIdInHub

No package ID was found in Dev Hub for package ID: %s.

# errorPackageAndPackageIdCollision

You can’t have both "package" and "packageId" (deprecated) defined as dependencies in sfdx-project.json.

# errorPackageAndIdCollision

You can’t have both "package" and "id" (deprecated) defined in your sfdx-project.json file.

# errorMissingPackage

The package "%s" isn’t defined in the sfdx-project.json file. Add it to the packageDirectories section and add the alias to packageAliases with its 0Ho ID.

# errorCouldNotFindPackageUsingPath

Could not find a package in sfdx-project.json file using "path" %s. Add it to the packageDirectories section and add the alias to packageAliases with its 0Ho ID.

# errorEmptyPackageDirs

sfdx-project.json must contain a packageDirectories entry for a package. You can run the force:package:create command to auto-populate such an entry.

# errorProfileUserLicensesInvalidValue

Can’t create package version. Check your sfdx-project.json file and set includeProfileUserLicenses to either true or false. Then try package version creation again.

# errorPathNotFound

The directory [%s] doesn’t exist in the current directory.

# unknownError

Package version creation failed with unknown error.

# malformedUrl

The %s value "%s" from the command line or sfdx-project.json is not in the correct format for a URL. It must be a valid URL in the format "http://salesforce.com". More information: https://nodejs.org/api/url.html#url_url_strings_and_url_objects

# requestInProgress

Version create.

# packageVersionCreateWaitingStatus

%d minutes remaining until timeout. Create version status: %s

# packageVersionCreateFinalStatus

Create version status: %s

# language

(TBD) language used for the labels on components.

# languageLong 

(TBD) language used for the labels on components.
