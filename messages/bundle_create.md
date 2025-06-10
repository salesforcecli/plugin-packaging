# summary

Create a bundle.

# description

First, use this command to create a bunle. Then create a bundle version.

Your --name value must be unique within your namespace.

Run '<%= config.bin %> bundle list to list all bundles in the Dev Hub org.

# examples

- Default Use Case
  <%= config.bin %> <%= command.id %> --name <bundle_name> --description "<bundle_description>" --target-dev-hub <dev_hub_alias>`

# flags.name.summary

Name of the bundle to create.

# flags.description.summary

Description of the bundle
