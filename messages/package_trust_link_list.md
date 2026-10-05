# summary

List the request to establish a trust link between an authoring org and a Verified Partner Business Org (PBO).

# description

Run this command against a Verified PBO to list inbound trust link requests from authoring orgs (1GP namespace orgs or 2GP Dev Hubs). To distribute packages on AgentExchange, authoring orgs are required to have a trust link with a Verified PBO.

Results include the request ID, requesting user, authoring org ID, status, and request date. Use --status to filter. Status "approved" maps to an Approved trust link.

The authoring org’s name and its packages are not returned by the Tooling API for this entity. You must use the request ID with the approve, deny, or revoke status.

# examples

- List all inbound trust link requests in the target Verified PBO:

  <%= config.bin %> <%= command.id %> --target-org pbo@example.com

- List only pending requests:

  <%= config.bin %> <%= command.id %> --target-org pbo@example.com --status pending

- List accepted (approved) links as JSON:

  <%= config.bin %> <%= command.id %> --target-org pbo@example.com --status approved --json

# flags.status.summary

Filter results by request status: pending, approved, declined, or revoked.

# flags.status.description

"approved" selects Approved records. Pending, declined, or revoked requests are included only when this flag is omitted.
