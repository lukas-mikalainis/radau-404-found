# Radau audit

2026-09-24. Scope: local source, configuration, public assets, SQLite inventory, uploads, existing documents, build and browser flows. The remote deployment was not accessed or changed.

**WORKING:** React/Vite UI, Express API, SQLite persistence, six labelled demo records, lost creation with image, search, category/location/status filters, details and token-protected resolution. Existing build, API and browser tests passed before changes.

**PARTIALLY WORKING:** mobile navigation disappeared; API/network errors were inconsistent; management codes needed manual copying. Existing tests did not cover found creation or a real process restart.

**BROKEN:** missing uploads fell through to SPA HTML; broken images had no fallback; malformed JSON/missing bodies became generic 500 responses. Storage and asset paths depended on the launch directory. Startup always printed port 3001.

**MISSING:** date interval filtering, publication review, requested architecture/project/demo documents and cross-platform demo startup.

## Resolution

- Preserved frameworks, SQLite schema, records, routes and design.
- Shared form/server validation, localized errors and bounded multipart fields.
- Restricted upload serving, proper asset 404 responses, cleanup of only a failed request's new file.
- Date interval filter, mobile navigation, image fallback, retries, error focus and code copying.
- Stable default paths, optional persistent directories, correct port logging, build checks, health endpoint and shutdown handling.
- Negative request tests, both browser creation flows and a production process restart test.

No existing records were deleted, reseeded or rewritten. At audit time the local DB contained six demo records and uploads was empty. Remote data may differ. This directory is not a Git repository, so commit history could not be audited.

See [test results](TEST_RESULTS.md) and [publication review](../PUBLICATION_CHECK.md). Older Lithuanian documents remain historical planning references.
