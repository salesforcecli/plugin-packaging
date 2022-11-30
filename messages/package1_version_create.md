# cliDescription

create a first-generation package version in the release org
The package version is based on the contents of the specified metadata package. Omit -m if you want to create an unmanaged package version.

# id

ID of the metadata package (starts with 033) of which you’re creating a new version

# idLong

ID of the metadata package (starts with 033) of which you’re creating a new version.

# name

package version name

# nameLong

Package version name.

# description

package version description

# descriptionLong

Package version description.

# version

package version in major.minor format, for example, 3.2

# versionLong

Package version in major.minor format, for example, 3.2.

# releaseNotes

release notes URL

# releaseNotesLong

The release notes URL. This link is displayed in the package installation UI to provide release notes for this package version to subscribers.

# postInstall

post install URL

# postInstallLong

The post-install instructions URL. The contents of the post-installation instructions URL are displayed in the UI after installation of the package version.

# managedReleased

create a managed package version

# managedReleasedLong

Creates a managed package version. To create a beta version, don’t include this parameter.

# installationKey

installation key for key-protected package (default: null)

# installationKeyLong

Installation key for creating the key-protected package. The default is null.

# wait

minutes to wait for the package version to be created (default: 2 minutes)

# waitLong

Minutes to wait for the package version to be created. The default is 2 minutes.

# uploadFailure

Package upload failed. ${os.EOL}%s

# package1VersionCreateCommandInvalidVersion

Version supplied, %s, is not formatted correctly. Enter in major.minor format, for example, 3.2.

# SUCCESS

Successfully uploaded package [%s]

# QUEUED

PackageUploadRequest has been enqueued. You can query the status using
sfdx force:package1:beta:version:create:get -i %s -u %s
