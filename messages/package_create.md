# summary

Create a package.

# description

First, use this command to create a package. Then create a package version.

If you don’t have a namespace defined in your sfdx-project.json file, use --no-namespace.

Your --name value must be unique within your namespace.

Run '<%= config.bin %> package list to list all packages in the Dev Hub org.

# examples

- Create an unlocked package from the files in the "force-app" directory; uses your default Dev Hub org:

  <%= config.bin %> <%= command.id %> --name MyUnlockedPackage --package-type Unlocked --path force-app

- Create a managed packaged from the "force-app" directory files, give the package a description, and use the specified Dev Hub org:

  <%= config.bin %> <%= command.id %> --name MyManagedPackage --description "Your Package Descripton" --package-type Managed --path force-app --target-dev-hub devhub@example.com

# flags.name.summary

Name of the package to create.

# flags.org-dependent.summary

Depends on unpackaged metadata in the installation org; applies to unlocked packages only.

# flags.org-dependent.description

Use Source Tracking in Sandboxes to develop your org-dependent unlocked package. For more information, see "Create Org-Dependent Unlocked Packages" in the Salesforce DX Developer Guide.

# flags.error-notification-username.summary

Active Dev Hub user designated to receive email notifications for package errors.

# flags.error-notification-username.description

Email notifications include information about unhandled Apex exceptions, and install, upgrade, or uninstall failures associated with your package.

# flags.description.summary

Description of the package.

# flags.no-namespace.summary

Create the package with no namespace; available only for unlocked packages.

# flags.no-namespace.description

This flag is useful when you’re migrating an existing org to packages. But use a namespaced package for new metadata.

# flags.package-type.summary

Type of package.

# flags.package-type.description

The options for package type are Managed and Unlocked (Managed=DeveloperManagedSubscriberManaged, Unlocked=DeveloperControlledSubscriberEditable). These options determine upgrade and editability rules.

# flags.path.summary

Path to directory that contains the contents of the package.
