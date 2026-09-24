# Test results

Date: 2026-09-24. Environment: Windows, Node.js 24.16.0, npm and installed Microsoft Edge through Playwright. All test records/files use isolated temporary storage; existing application records were not reset.

| Check | Result |
|---|---|
| Baseline `npm test`, build and browser scenario before changes | Passed |
| Clean source copy with no dependencies/build/runtime data: `npm ci` | Passed |
| Production build from clean copy | Passed |
| Actual `npm start` in clean copy | Started; health endpoint and homepage returned 200 |
| `npm test` | 3 integration scenarios passed, none skipped after build |
| Expanded `npm run test:browser` | Passed on updated project and clean copy |
| `npm audit` | 0 reported vulnerabilities at time of test |
| Database inventory after tests | Original 6 demo records preserved |

## Coverage

API checks: lost and found creation, optional image, JPEG/PNG/WebP processing via a real PNG fixture, public field projection, case-insensitive Lithuanian search, combined type/category/location/date filters, invalid date intervals and duplicated query parameters, 404 records, wrong/missing management code, resolution and retained original type.

Failure checks: missing request body, malformed JSON, oversized JSON, broken multipart, duplicate fields, oversized file, non-image bytes and SVG disguised as JPEG. Missing/path-like uploads and hidden-file requests return 404, without exposing project files. Failed submissions do not create extra records/files. Runtime health remains responsive.

Persistence: close/reopen SQLite, then a separate production process test that creates a listing, stops the process, restarts it, reads the same record and loads its detail route. The process runs from an unrelated working directory. Clean-copy testing also caught and fixed a deep-route 404 caused by a hidden parent directory; `sendFile` now uses the exact index filename relative to its explicit build root.

Browser: homepage, empty/filter reset, invalid form and focus, lost creation with photo, direct detail refresh, resolved state, found creation without photo, wrong-code error then valid resolution, returned list, persisted combined filters, offline error/retry, broken-image fallback, missing listing and missing page. No uncaught page JavaScript errors in that scenario.

Visual checks: desktop and 375 px mobile homepage, mobile detail/error state and form validation layout reviewed. Updated screenshots contain fictional contacts only. Mobile home/form had no horizontal overflow. Skip link and mobile navigation are available; this is not a complete screen-reader audit.

Vite emits a nonblocking React Router `use client` directive warning. Build and browser checks pass.

## Not claimed

- This revision has not been deployed to or tested against the user's remote server.
- No Linux machine, load test, five-user study, full accessibility certification or backup restoration was tested.
- Rate limiting, moderation, accounts and management-code recovery are not implemented.
- A dependency audit or pattern-based source scan cannot guarantee the absence of all vulnerabilities or secrets.

Reproduce: `npm ci`, `npm run build`, `npm test`, `npm run test:browser`. See [README](../README.md) for browser prerequisites and [publication review](../PUBLICATION_CHECK.md) before sharing code.
