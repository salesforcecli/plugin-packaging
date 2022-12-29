# summary

list package versions for the specified first-generation package or for the org

# package-id

metadata package ID (starts with 033)

# package-id-long

Metadata package ID (starts with 033) whose package versions you want to list. If not specified, shows all versions for all packages (managed and unmanaged) in the org.

# package-id-invalid

Verify that you entered a valid package version ID (starts with 033) and try again.

# examples

$ sfdx force:package1:version:list
$ sfdx force:package1:version:list --package 03346000000MrC0XXX
