# Publication check

**Decision: REVIEW REQUIRED before publishing the whole workspace.**

Audit date: 2026-09-24. No publishing, repository creation or remote changes were performed.

## SAFE TO PUBLISH

After a final staged-diff review:

- `src/`, `server/`, `shared/`, `public/` and `tests/` source.
- `package.json`, `package-lock.json`, `index.html`, `vite.config.js`, `.nvmrc`, `.gitignore` and the placeholder-only `.env.example`.
- README and newly written project/architecture/deployment/demo/test documents.
- The reviewed `docs/screenshots/` images from isolated tests with fictional contacts. No actual management code is visible.

The source inspection found no hardcoded live passwords, API keys, private keys, private IPv4 addresses or private deployment hostnames. Found email literals use `example.invalid`. Keywords such as `token`, `password`, `authorization` and `bearer` occur in the intended management-code implementation/tests and are not themselves leaked credentials. Dependency names and CSS classes can also trigger keyword checks.

## KEEP PRIVATE

- `data/`, `uploads/`, all SQLite/WAL/SHM files and backups. Even a currently empty/demo-only copy should not become a repository's runtime data.
- Real `.env` files, credentials, certificates/private keys, service tokens, private logs and host-specific deployment configuration.
- `.private/`, `.presentation-build/` and their audit/build outputs.
- `node_modules/`, `dist/`, test artifacts, temporary archives and coverage output.
- Original supplied lecture PPTX files and `docs/skaidriu-tekstas.txt`; these are course source material rather than project code.
- `deliverables/` by default, until the team reviews the presentation/Discord material for public sharing.

`.gitignore` now excludes these categories. It does not remove already committed files or revoke leaked credentials.

## REVIEW MANUALLY

- Team member names, proposed roles and permission to share team materials.
- Copyright/permission for lecturer slides and extracted text. Do not include originals merely because they are in the same folder.
- Any new screenshots, actual user records or images added after this audit.
- The remote server's code, environment and stored data: not accessible in this audit.
- Any existing remote repository/history: the local directory is **not a Git repository**, so no commits existed here to examine.
- Third-party dependency licenses before choosing a repository license. This audit does not assign ownership of teammates' work.

## Checks performed

Source, configuration, documents, generated frontend and Office XML text were searched for password/passwd/secret/token/api_key/apikey/authorization/bearer/cookie/session/credentials/Tailscale terms, private IPv4 patterns, emails, Lithuanian phone-number patterns, common provider credential formats and private-key headers. Source hits were reviewed in context. Text scanning cannot certify secrets hidden inside arbitrary pictures or every possible credential format.

Runtime SQLite was inspected read-only at the metadata/inventory level: six marked demo records; uploads was empty. Dependencies were checked with `npm audit`: zero reported vulnerabilities at audit time. Security behavior was exercised with invalid uploads, malformed forms/JSON, missing/path-like assets and incorrect management codes.

## Before the first public push

Initialize or use the intended repository, stage only the reviewed source/document files, then inspect `git status --short`, `git diff --cached --stat` and `git diff --cached`. Confirm ignored runtime/lecture/private files are absent from `git ls-files`. If a separate existing repository already tracked secrets, remove them from history as appropriate and rotate them before publication. Nothing here authorizes or performs that publication.
