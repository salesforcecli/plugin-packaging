# cliDescription

creates a second-generation package version from a first-generation package

The package convert creates a new package in the Dev Hub if one does not already exist for the specified first-generation package.

It then creates a new package version in the Dev Hub with contents based on the specified first-generation package.

The latest released non-patch package version from the specified first-generation package will be converted.

To retrieve details about a package version create request, including status and package version ID (04t), run "sfdx force:package:version:create:report -i 08c...".

We recommend specifying the --installationkey to protect the contents of your package and to prevent unauthorized installation of your package.

To list package version creation requests in the org, run "sfdx force:package:version:create:list".

# examples

$ sfdx force:package:convert --package 033xx0000004Gmn -k password123

# package

ID (starts with 033) of the first-generation package to convert

# longPackage

The ID (starts with 033) or alias of the package to convert.

# key

installation key for key-protected package (either --installationkey or --installationkeybypass is required)

# longKey

Installation key for creating the key-protected package. Either an --installationkey value or the --installationkeybypass flag is required.

# keyBypass

bypass the installation key requirement (either --installationkey or --installationkeybypass is required)

# longKeyBypass

Bypasses the installation key requirement. If you bypass this requirement, anyone can install your package. Either an --installationkey value or the --installationkeybypass flag is required.

# definitionfile

path to a definition file that contains features and org preferences that the metadata of the package version depends on.

# longDefinitionfile

The path to a definition file, similar to the scratch org definition file, that contains the list of features and org preferences that the metadata of the package version depends on.

# wait

minutes to wait for the package version to be created

# longWait

The number of minutes to wait for the package version to be created.

# instance

the instance where the conversion package version will be created——for example, NA50

# longInstance

The instance where the conversion package version will be created——for example, NA50.
