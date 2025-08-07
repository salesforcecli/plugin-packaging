# summary

Predict the runtime for package push upgrade.

# description

Predicts the runtime for upgrading a package in one or many orgs from one version to another version.
This command provides an estimate of how long a package push upgrade will take, including average time and confidence intervals.

# flags.target-dev-hub.summary

Username or alias of the Dev Hub org that owns the package.

# flags.target-dev-hub.description

Overrides the value of the target-dev-hub configuration variable, if set.

# flags.package.summary

ID (starts with 04t) of the package version that the package is being upgraded to. The package version must be an active, non-beta package version.

# examples

- Predict runtime for a package push upgrade:
  <%= config.bin %> <%= command.id %> --package 04txyz --target-dev-hub myHub

# prediction.success

We predict that it will take %s with a 95% prediction interval from %s to %s.

# prediction.failure

We were unable to make a prediction for the upgrade runtime.

# error.invalid-package-version

Invalid package version. Please provide a valid package version ID that starts with '04t'.

# error.package-not-found

Package version not found. Please verify the package version ID and ensure it exists in the target Dev Hub org.

# error.prediction-failed

Failed to predict upgrade runtime. Please try again or contact support if the issue persists.
