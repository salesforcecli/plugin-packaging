# actionRequiredHeader

Action Required!

# WildCardError

ERROR: This command doesn't support wildcards. Remove the wildcard, and run the command again.
See --help for examples.

# GeneralCommandFailure

This command failed.

# InvalidProjectWorkspace

This directory does not contain a valid Salesforce DX project.

# MissingClientConfig

Missing a client configuration. Please run the config command.

# TestMessage

This is a test message do not change.

# MissingAppConfig

The current project is invalid. sfdx-project.json is missing.

# OldSfdxWorkspaceJsonPresent

Project file %s\nsfdx-workspace.json needs to be renamed to sfdx-project.json

# UndefinedLocalizationLabel

Missing label %s:%s for locale %s.

# LoginServerNotFound

The hostname for the login server is not found: %s:%s

# InvalidProjectDescriptor

This project descriptor is in invalid. The attribute [%s] is not found.

# MissingRequiredParameter

A required parameter [%s] is missing.

# InvalidParameter

Invalid [%s] parameter: %s

# MissingScratchOrgNamespace

The [NamespacePrefix] is missing from the ScratchOrgInfo.

# MaxOrgIds

The maximum number of local orgs (%s) has been reached

# MaxOrgIdsAction

Use "sfdx force:org:list --clean" to remove outdated org configurations.

# UserSessionIsInvalid

%s: The user session for this org is expired or invalid. Please run config.

# MissingScratchOrgDef

A scratch org definition file not found at %s. Please create it.

# NonScratchOrgPush

You can push source only to scratch orgs using this command. Use "sfdx force:source:deploy" or "sfdx force:mdapi:legacy:deploy" to deploy changes to orgs that don’t have change tracking.

# ProblemQueryingOrganizationSettingsDetail

No organization settings found

# ProblemSettingOrgPrefs

Cannot set org preferences. %s

# ProblemDeployingSettings

Failed to deploy settings to scratch org.

# PathDoesNotExist

The specified path [%s] does not exist

# InvalidArgumentFilePath

Invalid argument to --%s. You specified a directory path [%s], but a file is required.

# InvalidArgumentDirectoryPath

Invalid argument to --%s. You specified a file path [%s], but a directory is required.

# InvalidValueForDefaultPath

In sfdx-project.json, set the default to true or false. Example: [{ "path": "packageDirectory1", "default": true }, { "path": "packageDirectory2", "default": false }]

# MultipleDefaultPaths

In sfdx-project.json, indicate only one package directory (path) as the default.

# MissingDefaultPath

In sfdx-project.json, be sure to specify which package directory (path) is the default. Example: [{ "path": "packageDirectory1", "default": true }, { "path": "packageDirectory2" }]

# InvalidPackageDirectory

The path %s, specified in sfdx-project.json, does not exist. Be sure this directory is included in your project root.

# InvalidAbsolutePath

The path %s, specified in sfdx-project.json, must be indicated as a relative path to the project root.

# IncorrectLogLevel

valid values are {%s}

# LoggerNameRequired

A logger name is required

# InvalidVariableReference

Invalid variable reference: variable "%s" not found or unset.

# ValidationSchemaFieldErrors

Schema validation failed with following errors:
%s

# ValidationSchemaUnknown

Schema validation failed with unknown error

# InvalidJson

An error occurred parsing "%s"

# JsonParseError

Parse error in file %s on line %s
%s

# InvalidJsonCasing

All JSON input must have heads down camelcase keys. E.g., { sfdcLoginUrl: "https:\n\nlogin.salesforce.com" }
Found "%s" in
%s

# NoWorkspaceOrUser

Command must be executed in a project directory or with the --${TARGET_USERNAME_PARAM} flag.

# OrgDataNotAvailableError

An attempt to refresh the authentication token failed with a "Data Not Found Error". The org identified by username %s doesn't appear to exist. Likely cause is that the org was deleted by another user or has expired.

# OrgDataNotAvailableErrorAction

Run "sfdx force:org:list --clean" to remove stale org authentications.
Use "sfdx force:config" to update the defaultusername.
Use "sfdx force:org:create" to create a new org.
Use "sfdx force:auth" to authenticate an existing org.

# InvalidCommandGroup

You have specified an invalid command group in which to stash your values. Please verify that you are specifying a valid command or register your command in stash.js under Stash#Commands.

# schemaInfoOption

display schema information for the --%s configuration file to stdout; if you use this option, all other options except --json are ignored

# schemaInfoOptionLong

Displays the schema information for the configuration file. If you use this option, all other options, except --json, are ignored.

# invalidInstanceUrlForAccessTokenAction

Verify that the instanceUrl config setting is set to the instance that the access token belongs to.
Use "sfdx force:config:list" to view your current setting.
Use "sfdx force:config:set instanceUrl=<instance URL> --global" to set your instanceUrl to the correct instance.

# invalidBooleanConfigValue

The config value can only be set to true or false.

# cliForceConfigHelp

configures this project with a scratch org

# cliForceConfigHelpClientId

specify the connected app client ID for the master org

# cliForceConfigHelpClientSecret

specify the connected app client secret for the master org

# cliForceConfigHelpClientRedirectUri

specify the connected app redirect uri for the master org

# cliForceConfigHelpUsername

the master org username

# cliForceConfigHelpPassword

the master org password

# cliForceConfigHelpSuccess

successfully updated the SFDC accessToken

# cliForceSyncHelp

synchronize Salesforce source between the scratch org and the project

# cliForceSyncUpHelp

synchronize project source to the scratch org

# cliForceSyncDownHelp

synchronize scratch org source to the project

# cliForceHelp

tools for the Salesforce developer

# cliForceSyncTypeHelp

[All | Changed] Sync all or only the changed source. All is default.

# cliForceRefreshHelp

Refreshes the auth token for the scratch org.

# cliForceRefreshSuccess

Successfully reset the org auth token. Chive on!

# cliForceCreateHelpType

The type of source to create. Values: [ScratchOrg]]

# cliForceCreateHelpFile

Path to a file containing org signup parameters, in JSON format.

# cliForceCreateHelpJson

The org signup parameters in JSON format.

# cliForceCreateHelpPassword

Password for the admin user.

# cliForceCreateMessageWrongType

Unsupported type. Valid types are [%s].

# cliForceCreateMessageSuccess

Scratch org successfully created with id: %s

# cliForceCreateMessagePassword

Setting org password...

# cliForceCreateMessagePasswordOk

Ok

# cliForceCreateNoConfig

Please specify an org configuration via file and\nor key=value pairs

# oauthBrowserSuccess

Successfully updated the auth configuration for the org.

# closeTheBrowser

You may now close the browser.

# urlStateMismatch

The Oauth redirect listener encountered an http request that is not trusted. Ignoring.

# keyChainItemCreateFailed

Attempting to create an encryption key failed. %s

# UnsupportedOperatingSystem

Unsupported Operating System: %s

# invalidEncryptedFormat

The encrypted data is not properly formatted.

# invalidEncryptedFormatAction

If attempting to create a scratch org then re-authorize. Otherwise create a new scratch org.

# authDecryptFailed

Failed to decipher auth data. reason: %s.

# genericTimeoutMessage

Socket timeout occurred while listening for results.

# genericTimeoutCommandWaitMessageAction

Use command "%s" to retry. You may consider increasing --wait parameter value to increase timeout.

# genericTimeoutWaitMessageAction

You may consider increasing the --wait parameter value to increase timeout.

# subscriberHandshakeTimeout

Subscriber handshake failed due to a socket timeout.

# subscriberHandshakeTimeoutAction

Check your connection to force.com and try again

# herokuTopicDescription

tools for the Salesforce developer

# invalidApiVersion

An invalid api version is being reported by config. (apiVersion=%s)

# streamingWait

the streaming client socket timeout (in minutes)

# streamingWaitLong

Sets the streaming client socket timeout, in minutes. If the streaming client socket has no contact from the server for a number of minutes, the client exits. Specify a longer wait time if timeouts occur frequently.

# createOrgCommandDuration

duration of the scratch org (in days) (default:7, min:1, max:30)

# createOrgCommandDurationLong

Sets the duration of the scratch org, in days. Valid values are from 1-30. The default is 7 days.

# unrecognizedScratchOrgOption

%s is not a supported option for scratch org configuration.

# herokuNamespaceDescription

tools for the Salesforce developer

# jsonOutputOption

format output as json

# jsonOutputOptionLong

Format output as JSON.

# loglevelOption

logging level for this command invocation

# loglevelOptionLong

The logging level for this command invocation. Logs are stored in $HOME\n.sfdx\nsfdx.log.

# usernameOption

username or alias for the target org

# usernameOptionLong

A username or alias for the target org.

# targetUsernameOption

username or alias for the target org; overrides default target org

# targetUsernameOptionLong

A username or alias for the target org. Overrides the default target org.

# perfLogLevelOption

get API performance data

# perfLogLevelOptionLong

Gets data on API performance metrics from the server. The data is stored in $HOME\n.sfdx\napiPerformanceLog.json

# invalidPortNumber

Invalid OAuth redirect port number defined: %s

# ClientSecretRequired

The client secret is required.

# authorizeCommandMissingJwtOption

Both username and file must be provided.

# authorizeCommandMissingClientId

The client ID is required for the JWT-based authentication process

# authorizeCommandSuccess

Successfully authorized %s with org ID %s

# authorizeCommandCloseBrowser

You may now close the browser

# createOrgCommandSuccess

Successfully created scratch org: %s, username: %s

# createOrgCommandDescription

create a scratch org

# createOrgCommandDescriptionLong

Creates a scratch org using values specified in a configuration file or key=value pairs that you specify on the command line. Values specified on the command line override values in the configuration file.

# createOrgCommandHelp

To set up a connected app for your new scratch org, specify the value that was returned when you created a connected app in your Dev Hub org as --clientid.

Examples:
$ sfdx force:org:create -f config\nenterprise-scratch-def.json -a TestOrg1
$ sfdx force:org:create -a MyDevOrg -s -v me@myhub.org edition=Developer
$ sfdx force:org:create -f config\nenterprise-scratch-def.json -a OrgWithOverrides username=testuser1@mycompany.org

# createOrgCommandClientId

connected app consumer key

# createOrgCommandClientIdLong

Connected app consumer key, as configured in your Dev Hub.

# createOrgCommandSet

set the created org as the default username

# createOrgCommandSetLong

Sets the created org as the default username.

# createOrgCommandAlias

set an alias for the created scratch org

# createOrgCommandAliasLong

Sets an alias for the created scratch org.

# createOrgTargetDevhubUsername

username or alias for the dev hub org; overrides default dev hub org

# createOrgTargetDevhubUsernameLong

A username or alias for the target Dev Hub org. Overrides the default Dev Hub org.

# createOrgCommandFile

path to a scratch org definition file

# createOrgCommandFileLong

Path to a scratch org definition file. Either --definitionfile or a vararg value for edition (for example, edition=Developer) is required. Varargs override the values in the scratch org definition file.

# createOrgCommandObject

scratch org definition in json format

# createOrgCommandObjectLong

Scratch org definition in JSON format. Either --definitionfile or --definitionjson is required.

# createOrgCommandNoNamespace

creates the scratch org with no namespace

# createOrgCommandNoNamespaceLong

Creates the scratch org with no namespace. Useful when using a scratch org to test installations of packages with namespaces.

# createOrgCommandNoAncestors

do not include second-generation package ancestors in the scratch org

# createOrgCommandNoAncestorsLong

Do not include second-generation package ancestors in the scratch org.

# createOrgCommandEnv

environment where the scratch org is created: [%s]

# createOrgCommandEnvLong

Environment where the scratch org is created: [%s].

# createOrgCommandUnauthorized

You do not have access to the [%s] object

# createOrgTimeoutHintNoIdAction

Retry creating the org but increase the wait timeout.

# unsupportedValueForEnv

Unsupported value for env: [%s]

# unsupportedValueForDuration

Unsupported value for durationdays (must be 1-30): [%s]

# invalid_client

Invalid client credentials. Verify the OAuth client secret and ID.

# signupFailed

The request to create a scratch org failed with error code: %s.

# signupFailedUnknown

An unknown server error occurred. Please try again. If you still see this error, contact Salesforce support for assistance. Include the information from "sfdx force:data:record:get -s ScratchOrgInfo -i %s -u %s".

# signupFailedAction

See https:\n\ndeveloper.salesforce.com\ndocs\natlas.en-us.api.meta\napi\nsforce_api_objects_signuprequest.htm for information on error code %s.

# signupUnexpected

The request to create a scratch org returned an unexpected status

# signupFieldsMissing

Required fields are missing for org creation: [%s]

# signupDuplicateSettingsSpecified

You cannot use 'settings' and `'orgPreferences' in your scratch definition file, please specify one or the other.

# pushCommandAsyncRequestInvalidated

Salesforce cancelled the job because the results might not be valid. Is there a newer compile request?

# pushCommandAsyncRequestUnexpected

An unexpected error occurred during deploy.

# pushCommandCliInvalidUsernameOption

Invalid value for username

# pullCommandConflictMsg

We couldn’t complete the pull operation due to conflicts. Verify that you want to keep the remote versions, then run "sfdx force:source:legacy:pull -f" with the --forceoverwrite (-f) option.

# MissingMetadataExtension

Expected file at path: %s to end with the '-meta.xml' extension. Please rename the file to %s

# MissingMetadataFileWithMetaExt

Expected metadata file with '-meta.xml' extension at path: %s

# MissingMetadataFile

Expected metadata file at path: %s

# MissingContentFile

Expected content file(s) at path(s): %s

# MissingContentOrMetadataFile

Expected file at path: %s

# UnsupportedMimeTypes

The following MIME types are not supported: %s

# statusCommandCliDescription

list local changes and\nor changes in a scratch org

# statusCommandCliLongDescription

Lists changes that have been made locally, in a scratch org, or both.

# statusCommandCliHelp

Examples:
$ sfdx force:source:legacy:status -l
$ sfdx force:source:legacy:status -r
$ sfdx force:source:legacy:status -a
$ sfdx force:source:legacy:status -a -u me@example.com --json

# statusCommandAllOptionDescription

list all the changes that have been made

# statusCommandAllOptionDescriptionLong

Lists all the changes that have been made.

# statusCommandLocalOptionDescription

list the changes that have been made locally

# statusCommandLocalOptionDescriptionLong

Lists the changes that have been made locally.

# statusCommandRemoteOptionDescription

list the changes that have been made in the scratch org

# statusCommandRemoteOptionDescriptionLong

Lists the changes that have been made in the scratch org.

# statusCommandHumanSuccess

Source Status

# mdapiPullCommandNoDataReturned

No metadata was returned by the retrieve

# mdapiCliWaitTimeExceededError

Your %s request did not complete within the specified wait time [%s minutes]. Try again with a longer wait time.

# mdapiCliExclusiveFlagError

Specify either --%s or --%s but not both.

# mdapiCliInvalidWaitError

Specify the number of minutes to wait as a numerical value greater than or equal to -1. You can specify a decimal value if it is greater than 0.

# mdapiDeployFailed

The metadata deploy operation failed.

# mdapiDeployCanceled

The metadata deploy operation was canceled.

# mdapiTopicDescription

retrieve and deploy metadata using Metadata API

# mdapiTopicLongDescription

Use the mdapi commands to retrieve and deploy Metadata API–formatted files that represent components in an org, or to convert Metadata API–formatted metadata into the source format used in Salesforce DX projects.

# mdDeployCommandCliInvalidUsernameOption

That target username doesn’t exist. Try again with a valid target username.

# mdDeployCommandCliZipFileError

The --zipfile parameter requires a file path to a zip file. Try again.

# mdDeployCommandCliWaitTimeExceededError

The deploy request did not complete within the specified wait time [%s minutes].
To check the status of this deployment, run "sfdx force:mdapi:legacy:deploy:report"

# mdDeployCommandCliInvalidJobIdError

The job for [%s] doesn’t exist. Try again with a valid job ID.

# mdDeployCommandCliInvalidRequestIdError

The value [%s] provided for ID is not valid. It should be 15 or 18 characters long.

# mdDeployCommandCliNoRestDeploy

REST deploy is not available for this org. This feature is currently for internal Salesforce use only.

# mdRetrieveCommandCliInvalidUsernameOption

That target username doesn’t exist. Try again with a valid target username.

# mdRetrieveCommandCliWaitTimeExceededError

The retrieve request did not complete within the specified wait time [%s minutes].
To check the status of this retrieve, run "sfdx force:mdapi:legacy:retrieve:report%s"

# mdRetrieveCommandCliTooManyPackagesError

You specified [%s]. Try again and specify only one package when using --singlepackage.

# mdRetrieveCommandCliInvalidProjectError

You can’t create a manifest from an artifact when you’re not in a project. Move into a valid project or specify the manifest location using a parameter (--packagenames, --unpackaged).

# mdRetrieveCommandCliInvalidApiVersionError

Specify the API version as a positive numerical value less than or equal to the current API version (%s).

# mdapiRetrieveFailed

The metadata retrieve operation failed: %s

# pollTimeout

polling timeout in milliseconds (default %s ms)

# pollInterval

polling interval in milliseconds (default %s ms)

# waitParamValidValueError

Invalid value was specified for wait. Please provide a wait value greater than %s minutes.

# orgTopicDescription

manage your orgs

# orgTopicDescriptionLong

Use the org commands to manage the orgs you use with Salesforce CLI. Create and delete scratch orgs, list your created and authorized orgs, and open orgs in your browser.

# accessTokenLoginUrlNotSet

The instance URL is not set, or is incorrect for the given access token. API Error: %s

# userTopicDescription

perform user-related admin tasks

# userTopicDescriptionLong

Use the user commands to perform user-related admin tasks.

# pullCommandMetadataTypeLabel

Metadata Type

# pullCommandMetadataTypePath

Metadata Path

# pullCommandCliPreExecute

Pulling source changes from org %s as user %s

# pullCommandHumanSuccess

Pulled Source

# packageCliDescription

develop and install packages

# packageCliDescriptionLong

Use the package commands to develop and install packages.

# package1CliDescription

develop first-generation managed and unmanaged packages

# package1CliDescriptionLong

Use the package1 commands to create and view first-generation package versions in your Dev Hub org.

# package1VersionCreateCommandCliDescription

create a first-generation package version in the release org

# package1VersionCreateCommandCliDescriptionLong

Creates a first-generation package version in the release org.

# package1VersionCreateCommandCliHelp

The package version is based on the contents of the specified metadata package. Omit -m if you want to create an unmanaged package version.

# package1VersionCreateCommandId

ID of the metadata package (starts with 033) of which you’re creating a new version

# package1VersionCreateCommandIdLong

ID of the metadata package (starts with 033) of which you’re creating a new version.

# package1VersionCreateCommandName

package version name

# package1VersionCreateCommandNameLong

Package version name.

# package1VersionCreateCommandDescription

package version description

# package1VersionCreateCommandDescriptionLong

Package version description.

# package1VersionCreateCommandVersion

package version in major.minor format, for example, 3.2

# package1VersionCreateCommandVersionLong

Package version in major.minor format, for example, 3.2.

# package1VersionCreateCommandReleaseNotes

release notes URL

# package1VersionCreateCommandReleaseNotesLong

The release notes URL. This link is displayed in the package installation UI to provide release notes for this package version to subscribers.

# package1VersionCreateCommandPostInstall

post install URL

# package1VersionCreateCommandPostInstallLong

The post-install instructions URL. The contents of the post-installation instructions URL are displayed in the UI after installation of the package version.

# package1VersionCreateCommandManagedReleased

create a managed package version

# package1VersionCreateCommandManagedReleasedLong

Creates a managed package version. To create a beta version, don’t include this parameter.

# package1VersionCreateCommandInstallationKey

installation key for key-protected package (default: null)

# package1VersionCreateCommandInstallationKeyLong

Installation key for creating the key-protected package. The default is null.

# package1VersionCreateCommandWait

minutes to wait for the package version to be created (default: 2 minutes)

# package1VersionCreateCommandWaitLong

Minutes to wait for the package version to be created. The default is 2 minutes.

# package1VersionCreateCommandNotANumber

Field %s must contain only a numeric value: %s.

# package1VersionCreateCommandTimeout

Stopped waiting for package upload to finish. Wait time exceeded. waitTimeInMinutes = %s.

# package1VersionCreateCommandUploadFailure

Package upload failed.
%s

# package1VersionCreateHumanSuccess

Successfully created package version: %s for package %s.

# package1VersionListCommandLongDescription

Lists the versions for the specified package or all first-generation packages in the org.

# package1VersionListCommandCliDescription

list package versions for the specified first-generation package or for the org

# package1VersionListCommandCliHelp

If a metadata package ID is specified, lists all versions of the specified package. Otherwise, lists all package versions for the org. For each package version, the list includes the package version ID, metadata package ID, name, version number, and release state.

# package1VersionListCommandPackageId

metadata package ID (starts with 033)

# package1VersionListCommandPackageIdLong

Metadata package ID (starts with 033) whose package versions you want to list. If not specified, shows all versions for all packages (managed and unmanaged) in the org.

# package1VersionListHumanSuccess

Successfully created the package version list.

# package1VersionListAction

Verify that you entered a valid package ID and that you are authorized in the org. Then try again.

# package1VersionDisplayCommandLongDescription

Displays detailed information about an individual first-generation package version.

# package1VersionDisplayCommandCliDescription

display details about a first-generation package version

# package1VersionDisplayCommandCliHelp

Display detailed information about an individual package version, including metadata package ID, name, the release state, and build number.

# package1VersionDisplayCommandPackageId

metadata package version ID (starts with 04t)

# package1VersionDisplayCommandPackageIdLong

ID (starts with 04t) of the metadata package version whose details you want to display.

# package1VersionDisplayHumanSuccess

Successfully displayed the package version.

# package1VersionDisplayAction

Verify that you entered a valid package version ID and try again.

# package2VersionUpdateSetAsReleasedYesNo

Are you sure you want to release package version %s? You can't undo this action. Release package (y\nn)?

# packageVersionUpdateSetAsReleasedYesNo

Are you sure you want to release package version %s? You can't undo this action. Release package (y\nn)?

# attemptingToDeleteExpiredOrDeleted

Attempting to delete an expired or deleted org

# insufficientAccessToDelete

You do not have the appropriate permissions to delete a scratch org. Please contact your Salesforce admin.

# deleteOrgConfigOnlyCommandSuccess

Successfully deleted scratch org %s.

# deleteOrgCommandSuccess

Successfully marked scratch org %s for deletion

# deleteOrgCommandQueryError

Error querying for DevHubMember %s. We received %s results

# deleteOrgCommandPathError

The scratch org config for scratch org %s does not exist

# deleteOrgHubError

The Dev Hub org cannot be deleted.

# logoutOrgCommandSuccess

Successfully logged out of orgs.

# defaultOrgNotFound

No %s org found

# defaultOrgNotFoundAction

Run the "sfdx force:auth" commands with --setdefaultusername to connect to an org and set it as your default org.
Run "force:org:create" with --setdefaultusername to create a scratch org and set it as your default org.
Run "sfdx force:config:set defaultusername=<username>" to set your default username.

# defaultOrgNotFoundDevHubAction

Run the "sfdx force:auth" commands with --setdefaultdevhubusername to connect to a Dev Hub org and set it as your default Dev Hub.
Run "force:org:list" to see a list of locally registered orgs.
Run "sfdx force:config:set defaultdevhubusername=<username>" to set your default Dev Hub username.

# namedOrgNotFound

No org configuration found for name %s

# noResultsFound

No results found

# invalidVersionString

Invalid API version string.

# fullNameIsRequired

The fullName attribute is required.

# metadataTypeIsRequired

The metadata type attribute is required.

# unexpectedSmmToolingFullNameFormat

Unexpected format for FullName: %s.

# invalidResponseFromQuery

Invalid response from query: %s.

# keyChainServiceCommandFailed

Command failed with response.
%s

# keyChainServiceRequired

Can’t get or set a keychain value without a service name.

# keyChainAccountRequired

Can’t get or set a keychain value without an account name.

# keyChainPasswordNotFound

Could not find password.

# keyChainUserCanceled

User canceled authentication

# keyChainCredentialParseError

A parse error occurred while setting a credential.

# keychainGetCommandFailedAction

Determine why this command failed to get an encryption key for user %s: [%s].

# keychainSetCommandFailedAction

Determine why this command failed to set an encryption key for user %s: [%s].

# keychainPasswordNotFoundAction

Ensure a valid password is returned with the following command: [%s].

# retrieveKeyChainItemFailedAction

Ensure that user %s has a login keychain item named %s. If not re-run authorization.

# genericUnixKeychainInvalidPerms

Invalid file permissions for secret file

# genericUnixKeychainInvalidPermsAction

Ensure the file %s has the file permission octal value of %s.

# genericUnixKeychainServiceAccountMismatch

The service and account specified in %s do not match the version of the toolbelt.

# genericUnixKeychainServiceAccountMismatchAction

Check your toolbelt version and re-auth.

# sourceConflictDetected

Source conflict(s) detected.

# oauthInvalidGrant

This org appears to have a problem with its OAuth configuration. Reason: %s
username: %s,
clientId: %s,
loginUrl: %s,
privateKey: %s

# oauthInvalidGrantAction

Verify the OAuth configuration for this org. For JWT:${os.EOL}Ensure the private key is correct and the cert associated with the connected app has not expired.${os.EOL}Ensure the following OAuth scopes are configured [api, refresh_token, offline_access].${os.EOL}Ensure the username is assigned to a profile or perm set associated with the connected app.${os.EOL}Ensure the connected app is configured to pre-authorize admins.

# notSpecified

<Not Specified>

# metadataTypeNotSupported

We can’t retrieve the specified metadata object: %s. Certain metadata types, like %s are not currently supported by the CLI.
File a bug here: https:\n\ngithub.com\nforcedotcom\ncli\nissues and provide the name of the unsupported metadata type

# shapeCreateFailedMessage

Error creating scratch definition file. Please contact Salesforce support.
