# cliDescription

retrieve the status of a package version creation request

# examples

$ sfdx force:package1:version:create:get -i 0HD...
$ sfdx force:package1:version:create:get -i 0HD... -u devhub@example.com

# requestId

PackageUploadRequest ID

# requestIdLong

The ID of the PackageUploadRequest.

# IN_PROGRESS

PackageUploadRequest is still InProgress. You can query the status using
sfdx force:package1:version:create:get -i %s -u %s

# SUCCESS

Successfully uploaded package [%s]

# QUEUED

PackageUploadRequest has been enqueued. You can query the status using
sfdx force:package1:version:create:get -i %s -u %s

# uploadFailure

Package upload failed.
%s
