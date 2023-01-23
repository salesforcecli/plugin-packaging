# summary

Retrieve the status of a package version creation request.

# examples

- Get the status of the creation request for the package version with the specified ID in your default org:

  <%= config.bin %> <%= command.id %> --request-id 0HD...

- Same as previous example, but use the specified org:

  <%= config.bin %> <%= command.id %> --request-id 0HD... --target-org myorg@example.com

# flags.request-id.summary

ID of the PackageUploadRequest (starts with 0HD).

# IN_PROGRESS

PackageUploadRequest is still InProgress. You can query the status using
%s package1:version:create:get -i %s -o %s

# SUCCESS

Successfully uploaded package [%s]

# QUEUED

PackageUploadRequest has been enqueued. You can query the status using
%s package1:version:create:get -i %s -o %s

# uploadFailure

Package upload failed.
%s
