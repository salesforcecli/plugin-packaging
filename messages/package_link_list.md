# summary

List Public Secure (VerifiedDev) trust link requests for this verified org.

# description

Run this command against a verified packaging org (PBO). It lists inbound trust requests from authoring orgs (1GP namespace orgs or 2GP Dev Hubs).

Results include the request ID, requesting user, authoring org ID, status, and request date. Use --status to filter. Status "approved" maps to an Accepted trust.

Authoring org name and that org's packages are not returned by the Tooling API for this entity; use the request ID with approve, deny, or revoke.

# examples

- List all inbound Public Secure link requests in the target verified org:

  <%= config.bin %> <%= command.id %> --target-org pbo@example.com

- List only pending requests:

  <%= config.bin %> <%= command.id %> --target-org pbo@example.com --status pending

- List accepted (approved) links as JSON:

  <%= config.bin %> <%= command.id %> --target-org pbo@example.com --status approved --json

# flags.status.summary

Filter results by request status: pending, approved, declined, or revoked.

# flags.status.description

"approved" selects Accepted records. Failed requests are included only when this flag is omitted.
