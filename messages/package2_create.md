# cliDescription

create a second-generation package

# cliLongDescription

Creates a second-generation package.

# help

First, use this command to create a second-generation package. Then create a package version.

Your --name value must be unique within your namespace.

# examples

$ sfdx force:package2:create -n PackageName -d 'My New Package' -o Unlocked

Run 'sfdx force:package2:list' to list all second-generation packages in the Dev Hub org.

# name

package name

# nameLong

Name of the second-generation package to create.

# description

package description

# descriptionLong

Description of the second-generation package.

# noNamespace

creates the package with no namespace; available only for developer-controlled packages.

# noNamespaceLong

Creates the package with no namespace. Available only for developer-controlled packages. Useful when migrating an existing org to packages, but new metadata should use a namespaced package.

# containerOptions

[*Managed | Unlocked] container options for the package2 (Managed=DeveloperManagedSubscriberManaged, Unlocked=DeveloperControlledSubscriberEditable)

# containerOptionsLong

Container options for the package2.
Managed is default. Other options include Unlocked. (Managed=DeveloperManagedSubscriberManaged, Unlocked=DeveloperControlledSubscriberEditable).
These options determine the upgrade and editability rules.

# humanSuccess

Successfully created a second-generation package (package2).
