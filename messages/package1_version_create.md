# summary

create a first-generation package version in the release org
The package version is based on the contents of the specified metadata package. Omit -m if you want to create an unmanaged package version.

# examples

$ <%= config.bin %> <%= command.id %> --packageid 03346000000MrC0XXX --name example
$ <%= config.bin %> <%= command.id %> --packageid 03346000000MrC0XXX --name example --description "example description" --wait 30

# id

ID of the metadata package (starts with 033) of which you’re creating a new version

# id-long

ID of the metadata package (starts with 033) of which you’re creating a new version.

# name

package version name

# name-long

Package version name.

# description

package version description

# description-long

Package version description.

# version

package version in major.minor format, for example, 3.2

# version-long

Package version in major.minor format, for example, 3.2.

# release-notes

release notes URL

# release-notes-long

The release notes URL. This link is displayed in the package installation UI to provide release notes for this package version to subscribers.

# post-install

post install URL

# post-install-long

The post-install instructions URL. The contents of the post-installation instructions URL are displayed in the UI after installation of the package version.

# managed-release

create a managed package version

# managed-release-long

Creates a managed package version. To create a beta version, don’t include this parameter.

# installation-key

installation key for key-protected package (default: null)

# installation-key-long

Installation key for creating the key-protected package. The default is null.

# wait

minutes to wait for the package version to be created (default: 2 minutes)

# wait-long

Minutes to wait for the package version to be created. The default is 2 minutes.

# uploadFailure

Package upload failed. ${os.EOL}%s

# package1VersionCreateCommandInvalidVersion

Version supplied, %s, is not formatted correctly. Enter in major.minor format, for example, 3.2.

# SUCCESS

Successfully uploaded package [%s]

# QUEUED

PackageUploadRequest has been enqueued. You can query the status using
%s package1:version:create:get -i %s -u %s
