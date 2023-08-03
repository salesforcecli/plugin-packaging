# summary

Create a first-generation package version in the release org.

# description

The package version is based on the contents of the specified metadata package. Omit --managed-released if you want to create an unmanaged package version.

# examples

- Create a first-generation package version from the package with the specified ID and name the package version "example"; use your default org:

  <%= config.bin %> <%= command.id %> --package-id 033... --name example

- Same as previous example, but provide a description and wait for 30 minutes for the package version to be created; use the specified org:

  <%= config.bin %> <%= command.id %> --package-id 033... --name example --description "example description" --wait 30 --target-org myorg@example.com

# flags.package-id.summary

ID of the metadata package (starts with 033) of which you’re creating a new version.

# flags.name.summary

Package version name.

# flags.description.summary

Package version description.

# flags.version.summary

Package version in major.minor format, for example, 3.2.

# flags.release-notes-url.summary

Release notes URL.

# flags.release-notes-url.description

This link is displayed in the package installation UI to provide release notes for this package version to subscribers.

# flags.post-install-url.summary

Post install URL.

# flags.post-install-url.description

The contents of the post-installation instructions URL are displayed in the UI after installation of the package version.

# flags.managed-released.summary

Create a managed package version.

# flags.managed-released.description

To create a beta version, don’t include this parameter.

# flags.installation-key.summary

Installation key for key-protected package (default: null).

# flags.wait.summary

Minutes to wait for the package version to be created (default: 2 minutes).

# uploadFailure

Package upload failed. ${os.EOL}%s

# package1VersionCreateCommandInvalidVersion

Version supplied, %s, is not formatted correctly. Enter in major.minor format, for example, 3.2.

# SUCCESS

Successfully uploaded package [%s]

# QUEUED

PackageUploadRequest has been enqueued. You can query the status using
%s package1:version:create:get -i %s -o %s
