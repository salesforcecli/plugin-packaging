# summary

Request a trust link from an authoring org to a Verified Partner Business Org (PBO).

# description

A trust link is an org-level trust between your authoring org and a Verified PBO, established through a two-way handshake: you request the link from your authoring org, and a PBO administrator approves it.

Run this command against your connected authoring org—the 1GP namespace org or the 2GP Dev Hub. The request starts in the Pending state until the PBO admin approves it. If a trust link already exists, delete it before requesting a new one.

# flags.verified-org.summary

Org ID (starts with 00D) of the Verified Partner Business Org to request a trust link to.

# examples

- Request a trust link from your authoring org to a Verified PBO:

  <%= config.bin %> <%= command.id %> --verified-org 00Dxx0000001gPLEAY --target-org myAuthoringOrg

# output

Requested a trust link to Verified Org %s. The request is Pending approval by a PBO administrator. [Trust link ID: %s]
