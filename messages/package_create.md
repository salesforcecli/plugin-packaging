# summary

create a package

First, use this command to create a package. Then create a package version.

If you don’t have a namespace defined in your sfdx-project.json file, use --no-namespace.

Your --name value must be unique within your namespace.

Run '<%= config.bin %> package:list to list all packages in the Dev Hub org.

# examples

$ <%= config.bin %> <%= command.id %> -n YourPackageName -t Unlocked -r force-app
$ <%= config.bin %> <%= command.id %> -n YourPackageName -d "Your Package Descripton" -t Unlocked -r force-app

# name

package name

# name-long

Name of the package to create.

# org-dependent

depends on unpackaged metadata in the installation org. Applies to unlocked packages only.

# org-dependent-long

Package depends on unpackaged metadata in the installation org. Applies to unlocked packages only.
Use Source Tracking in Sandboxes to develop your org-dependent unlocked package.
For more information, see "Create Org-Dependent Unlocked Packages" in the Salesforce DX Developer Guide.

# error-notification-username

active Dev Hub user designated to receive email notifications for package errors

# error-notification-username-long

An active Dev Hub org user designated to receive email notifications for unhandled Apex exceptions, and install, upgrade, or uninstall failures associated with your package.

# description

package description

# description-long

Description of the package.

# no-namespace

creates the package with no namespace; available only for unlocked packages.

# no-namespace-long

Creates the package with no namespace. Available only for unlocked packages. Useful when you’re migrating an existing org to packages. But, use a namespaced package for new metadata.

# package-type

package type

# package-type-long

Package type for the package.
The options for package type are Managed and Unlocked (Managed=DeveloperManagedSubscriberManaged, Unlocked=DeveloperControlledSubscriberEditable).
These options determine upgrade and editability rules.

# path

path to directory that contains the contents of the package

# path-long

The path to the directory that contains the contents of the package.
