# cliDescription

display the ancestry tree for a 2GP managed package version

# examples

$ sfdx force:package:version:displayancestry -p package_version_alias
$ sfdx force:package:version:displayancestry -p package_version_alias --dotcode
$ sfdx force:package:version:displayancestry -p OHo...
$ sfdx force:package:version:displayancestry -p 04t...

# package

ID or alias of the package (starts with 0Ho) or package version (starts with 04t) to display ancestry for

# packageLong

The ID or alias of the package or package version to display ancestry for. If you specify a package ID (starts with 0Ho) or alias, the ancestor tree for every package version associated with the package ID is displayed.
If you specify a package version (starts with 04t) or alias, the ancestry tree of the specified package version is displayed.

# dotcode

display the ancestry tree in DOT code

# dotcodeLong

Displays the ancestry tree in DOT code. You can use the DOT code output in graph visualization software to create tree visualizations.

# verbose

display both the package version ID (starts with 04t) and the version number (major.minor.patch.build) in the ancestry tree

# verboseLong

Displays both the package version ID (starts with 04t) and the version number (major.minor.patch.build) in the ancestry tree.
