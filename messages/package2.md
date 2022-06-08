# topicHelp

develop second-generation packages

# topicHelpLong

Use the package2 commands to create, install, and manage second-generation packages.

# createdLastDaysDescription

created in the last specified number of days (starting at 00:00:00 of first day to now; 0 for today)

# createdLastDaysLongDescription

Filters the list based on the specified maximum number of days since the request was created (starting at 00:00:00 of first day to now; 0 for today).

# modifiedLastDaysDescription

list items modified in the specified last number of days (starting at 00:00:00 of first day to now; 0 for today)

# modifiedLastDaysLongDescription

Lists the items modified in the specified last number of days, starting at 00:00:00 of first day to now. Use 0 for today.

# invalidId

Invalid %s: %s. Provide a valid ID that starts with %s.

# invalidDaysNumber

Provide a valid positive number for %s.

# invalidStatus

Invalid status '%s'. Please provide one of these statuses: %s

# package2NotEnabledAction

Second-generation packaging is not enabled on this org. Verify that you are authenticated to the desired org and try again. Otherwise, contact Salesforce Customer Support for more information.

# package2InstanceNotEnabled

Your org does not have permission to specify a build instance for your package version. Verify that you are authenticated to the desired org and try again. Otherwise, contact Salesforce Customer Support for more information.

# package2SourceOrgNotEnabled

Your Dev Hub does not have permission to specify a source org for your build org. Verify that you are authenticated to the correct Dev Hub and try again. Otherwise, contact Salesforce Customer Support for assistance.

# installStatus

Waiting for the package install request to complete. Status = %s

# errorMissingVersionNumber

The VersionNumber property must be specified.

# errorInvalidVersionNumber

VersionNumber must be in the format major.minor.patch.build but the value found is [%s].

# errorInvalidBuildNumber

The provided VersionNumber '%s' is invalid. Provide an integer value or use the keyword '%s' for the build number.

# errorInvalidPatchNumber

The provided VersionNumber '%s' is not supported. Provide a patch number of 0.

# errorInvalidMajorMinorNumber

The provided VersionNumber '%s' is invalid. Provide an integer value for the %s number.

# errorInvalidAncestorVersionFormat

The ancestor versionNumber must be in the format major.minor but the value found is [%s].

# errorNoMatchingAncestor

The ancestorId for ancestorVersion [%s] can't be found. Package 2 ID [%s].

# errorAncestorIdVersionMismatch

The ancestorVersion in sfdx-project.json is not the version expected for the ancestorId you supplied. ancestorVersion [%s]. ancestorID [%s].

# errorpackage2AncestorIdsKeyNotSupported

The package2AncestorIds key is no longer supported in a scratch org definition. Ancestors defined in sfdx-project.json will be included in the scratch org.
