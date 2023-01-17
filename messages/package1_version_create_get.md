# summary

retrieve the status of a package version creation request

# examples

$ <%= config.bin %> <%= command.id %> -i 0HD...
$ <%= config.bin %> <%= command.id %> -i 0HD... -o devhub@example.com

# requestId

PackageUploadRequest ID

# request-id-long

The ID of the PackageUploadRequest.

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
