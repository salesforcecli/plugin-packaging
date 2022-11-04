# cliDescription

create a package

First, use this command to create a package. Then create a package version.

If you don’t have a namespace defined in your sfdx-project.json file, use --nonamespace.

Your --name value must be unique within your namespace.

Run 'sfdx force:package:list' to list all packages in the Dev Hub org.

# examples

$ sfdx force:package:create -n YourPackageName -t Unlocked -r force-app
$ sfdx force:package:create -n YourPackageName -d "Your Package Descripton" -t Unlocked -r force-app

# name

package name

# nameLong

Name of the package to create.

# orgDependent

depends on unpackaged metadata in the installation org. Applies to unlocked packages only.

# orgDependentLong

Package depends on unpackaged metadata in the installation org. Applies to unlocked packages only.
Use Source Tracking in Sandboxes to develop your org-dependent unlocked package.
For more information, see "Create Org-Dependent Unlocked Packages" in the Salesforce DX Developer Guide.

# errorNotificationUsername

active Dev Hub user designated to receive email notifications for package errors

# errorNotificationUsernameLong

An active Dev Hub org user designated to receive email notifications for unhandled Apex exceptions, and install, upgrade, or uninstall failures associated with your package.

# description

package description

# descriptionLong

Description of the package.

# noNamespace

creates the package with no namespace; available only for unlocked packages.

# noNamespaceLong

Creates the package with no namespace. Available only for unlocked packages. Useful when you’re migrating an existing org to packages. But, use a namespaced package for new metadata.

# packageType

package type

# packageTypeLong

Package type for the package.
The options for package type are Managed and Unlocked (Managed=DeveloperManagedSubscriberManaged, Unlocked=DeveloperControlledSubscriberEditable).
These options determine upgrade and editability rules.

# path

path to directory that contains the contents of the package

# longPath

The path to the directory that contains the contents of the package.
