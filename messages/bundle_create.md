# summary

Create a package bundle in the Dev Hub org.

# description

A package bundle is an artifact that contains one or more 2GP managed packages.
A bundle can be listed on AppExchange, installed, or upgraded as a single artifact.

# examples

Create a package bundle in the Dev Hub org; uses the Dev Hub org with the username devhub@example.com:

sf package bundle create --name “Your bundle name” --description "Your bundle description" --target-dev-hub devhub@example.com

# flags.name.summary

Name of the package bundle.

# flags.description.summary

Description of the package bundle.
