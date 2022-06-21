# topicHelp

develop, install, and manage packages

# topicHelpLong

Use the package commands to develop, install, and manage packages.

# createdLastDaysDescription

created in the last specified number of days (starting at 00:00:00 of first day to now; 0 for today)

# createdLastDaysLongDescription

Filters the list based on the specified maximum number of days since the request was created (starting at 00:00:00 of first day to now; 0 for today).

# modifiedLastDaysDescription

list items modified in the specified last number of days (starting at 00:00:00 of first day to now; 0 for today)

# modifiedLastDaysLongDescription

Lists the items modified in the specified last number of days, starting at 00:00:00 of first day to now. Use 0 for today.

# invalidIdOrAlias

The %s: %s isn't defined in the sfdx-project.json. Add it to the packageDirectories section and add the alias to packageAliases with its %s ID.

# invalidDaysNumber

Provide a valid positive number for %s.

# invalidStatus

Invalid status '%s'. Please provide one of these statuses: %s

# packageNotEnabledAction

Packaging is not enabled on this org. Verify that you are authenticated to the desired org and try again. Otherwise, contact Salesforce Customer Support for more information.

# packageInstanceNotEnabled

Your org does not have permission to specify a build instance for your package version. Verify that you are authenticated to the desired org and try again. Otherwise, contact Salesforce Customer Support for more information.

# packageSourceOrgNotEnabled

Your Dev Hub does not have permission to specify a source org for your build org. Verify that you are authenticated to the correct Dev Hub and try again. Otherwise, contact Salesforce Customer Support for assistance.

# installStatus

Waiting for the package install request to complete. Status = %s

# errorMissingVersionNumber

The VersionNumber property must be specified.

# errorInvalidVersionNumber

VersionNumber must be in the format major.minor.patch.build but the value found is [%s].

# errorInvalidBuildNumber

The provided VersionNumber '%s' is invalid. Provide an integer value or use the keyword '%s' for the build number.

# errorInvalidBuildNumberForKeywords

The provided VersionNumber '%s' is invalid. Provide an integer value or use the keyword '%s' or '%s' for the build number.

# errorInvalidPatchNumber

The provided VersionNumber '%s' is not supported. Provide a patch number of 0.

# errorInvalidMajorMinorNumber

The provided VersionNumber '%s' is invalid. Provide an integer value for the %s number.

# errorInvalidAncestorVersionFormat

The ancestor versionNumber must be in the format major.minor.patch but the value found is [%s].

# errorNoMatchingMajorMinorForPatch

Can’t create patch version. The specified package ancestor [%s] either isn’t a promoted and released version, or can’t be found. Check the specified ancestor version, and then retry creating the patch version.

# errorNoMatchingAncestor

The ancestorId for ancestorVersion [%s] can't be found. Package ID [%s].

# errorAncestorNotReleased

The ancestor package version [%s] specified in the sfdx-project.json file hasn’t been promoted and released. Release the ancestor package version before specifying it as the ancestor in a new package or patch version.

# errorAncestorNotHighest

Can’t create package version. The ancestor version [%s] you specified isn’t the highest released package version. Set the ancestor version to %s, and try creating the package version again. You can also specify --skipancestorcheck to override the ancestry requirement.

# errorAncestorNoneNotAllowed

Can’t create package version because you didn’t specify a package ancestor. Set the ancestor version to %s, and try creating the package version. You can also specify --skipancestorcheck to override the ancestry requirement.

# errorAncestorIdVersionMismatch

Can’t create package version. The ancestorVersion listed in your sfdx-project.json file doesn’t map to this package. Ensure the ancestor ID is correct, or set the ID to ancestorID:HIGHEST to ensure the highest released package version is used as the ancestor. Then try creating the package version again.

# errorAncestorIdVersionHighestOrNoneMismatch

Can’t create package version. The ancestorId [%s] and ancestorVersion [%s] in your sfdx-project.json file don’t map to the same package version. Remove the incorrect entry, and try creating the package version again.

# errorpackageAncestorIdsKeyNotSupported

The package2AncestorIds key is no longer supported in a scratch org definition. Ancestors defined in sfdx-project.json will be included in the scratch org.

# errorInvalidIdNoMatchingVersionId

The %s %s is invalid, as a corresponding %s was not found

# errorIdTypeMismatch

ID type mismatch: an ID of type %s is required, but an ID of type %s was specified: %s

# updatedSfProject

sfdx-project.json has been updated.

# errorSfProjectFileWrite

sfdx-project.json could not be updated with the following entry for this package:
%s
Reason: %s

# invalidPackageTypeAction

Specify Unlocked or Managed for package type.

# invalidPackageTypeMessage

Invalid package type

# idNotFoundAction

It`s possible that this package was created on a different Dev Hub. Authenticate to the Dev Hub org that owns the package, and reference that Dev Hub when running the command.

# malformedPackageVersionIdAction

Use "sfdx force:package:version:list" to verify the 05i package version ID.

# malformedPackageVersionIdMessage

We can’t find this package version ID for this Dev Hub.

# malformedPackageIdAction

Use "sfdx force:package:list" to verify the 0Ho package version ID.

# malformedPackageIdMessage

We can’t find this package ID for this Dev Hub.
