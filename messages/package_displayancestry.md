# cliDescription

display the ancestry tree for a 2GP managed package version

# cliDescriptionLong

Displays the ancestry tree for a 2GP managed package version.

#examples

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

# invalidId

Can’t display the ancestry tree for %s. Specify a valid package ID (starts with 0Ho) or package version ID (starts with 04t), and try creating the ancestry tree again.

# parseError

Can’t display the ancestry tree. The specified package alias can’t be located. Check that you’re running this CLI command from the DX project directory, and try creating the ancestry tree again.

# versionNotFound

Can’t display the ancestry tree for %s. Verify the package version number (starts with 04t) or the package version alias listed in the sfdx-project.json file, and try creating the ancestry tree again.

# invalidAlias

Can’t display the ancestry tree for %s. The specified package alias can’t be found. Verify the package alias name listed in the sfdx-project.json, or specify the package ID or package version ID, and try creating the ancestry tree again.

# unlockedPackageError

Can’t display package ancestry. Package ancestry is available only for second-generation managed packages. Retry this command and specify a second-generation managed package or package version.

# noVersionsError

Can’t display package ancestry. The specified package has no associated released package versions. Retry this command after you create and promote at least one package version.
