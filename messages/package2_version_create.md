# cliDescription

create a second-generation package version

# cliLongDescription

Creates a second-generation package (package2) version in the Dev Hub org.

# help

The package version is based on the package contents in the specified directory.

To retrieve details about a package version create request, including status and package2 version ID (05i), run "sfdx force:package2:version:create:get -i 08c...".

To list package version creation requests in the org, run "sfdx force:package2:version:create:list".

Examples:
$ sfdx force:package2:version:create -d common
$ sfdx force:package2:version:create -i 0Ho... -d common

# package2Id

ID of the parent package (starts with 0Ho)

# longPackage2Id

ID of parent package (starts with 0Ho).

# dir

path to directory that contains the contents of the package version

# longDir

The path to the directory that contains the contents of the package version.

# branch

the package version’s branch

# longBranch

The package version’s branch.

# tag

the package version’s tag

# longTag

The package version’s tag.

# key

installation key for key-protected package (default: null)

# longKey

Installation key for creating the key-protected package. The default is null.

# preserve

temp files are preserved that would otherwise be deleted

# longPreserve

Specifies that the temp files are preserved that would otherwise be deleted

# validateschema

sfdx-project.json is validated against JSON schema

# longValidateschema

Specifies that the sfdx-project.json file should be validated against JSON schema

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

# InProgress

Package2 version creation request is InProgress. Run "sfdx force:package2:version:create:get -i %s" to query for status.

# Queued

Package2 version creation request is Queued. Run "sfdx force:package2:version:create:get -i %s" to query for status.

# Success

Successfully created the package2 version [%s]. Package2 Version Id: %s. Subscriber Package2 Version Id: %s.
Package Installation URL: %s%s
As an alternative, you can use the "sfdx force:package:install" command.

# errorMissingFlags

Include either a %s value or a %s value. The value must match one of the packageDirectories specified in sfdx-project.json.

# errorNoMatchingPackageDirectory

The %s value [%s], doesn’t match the %s value in any packageDirectories specified in sfdx-project.json.

# errorDirectoryIdMismatch

The %s value, [%s], and %s value, [%s], were both found in sfdx-project.json but don’t match. If you supply both values, they must match the path and id values in one of the packageDirectories.

# errorDependencyPair

Dependency must specify either a subscriberPackageVersionId or both packageId and versionNumber: %s.

# errorNoIdInHub

No package2 ID was found in Dev Hub for package2 ID: %s.

# errorEmptyPackageDirs

sfdx-project.json must contain a packageDirectories entry for a package. It has no entries, currently.

# unknownError

Package2 version creation failed with unknown error.

# undefinedStatus

Package2 version creation returned with status: %s.
