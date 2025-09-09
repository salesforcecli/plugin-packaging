# summary

List installed package bundles with expected vs actual component versions.

# description

Shows each installed bundle (by provided bundle version IDs) with its components, expected version from the Dev Hub bundle definition, and the actual installed version in the subscriber org. Highlights mismatches and missing packages.

# examples

- List specific installed bundles in your default org and dev hub:

  <%= config.bin %> <%= command.id %> --target-org me@example.com --target-dev-hub devhub@example.com -b 1Q8xxxxxxxAAAAAA -b 1Q8yyyyyyyBBBBBB

# flags.bundles.summary

One or more bundle version IDs to inspect.

# flags.bundles.description

Provide bundle version IDs (e.g., 1Q8...) to evaluate expected vs actual component versions.

# flags.verbose.summary

Show additional details.

# noBundles

No package bundles found in this org.


