# Running the existing deployment

Keep the existing server, domain and network configuration. No private addresses or credentials belong here.

Requirements: **Node.js 24.x**, npm and writable persistent storage. Install dependencies on the target OS; do not copy `node_modules` from another computer. One application process is enough for this MVP.

```sh
npm ci
npm run build
npm start
```

The default local address is `http://127.0.0.1:3001`. The existing proxy/tunnel must target that service. Binding remains loopback. A successful `npm start` does not itself make the application publicly reachable.

`npm start` uses Node's built-in loader for optional `.env`. Copy `.env.example` if needed. `PORT` defaults to 3001. Use absolute persistent `DATA_DIR` and `UPLOAD_DIR` paths if releases live in changing directories. Changing a path does not migrate existing data. Keep real settings private.

The server refuses production startup without `dist/index.html`, logs the selected port, serves `/api/health` and closes SQLite on graceful shutdown. Use the deployment's existing supervisor for restart/logout handling; this task does not install or reconfigure one.

## Updating safely

1. Stop the application through its existing supervisor.
2. Back up the full data and uploads directories together. Copying one live SQLite file is not a reliable WAL backup.
3. Update source files, preserving `.env`, runtime data and configured external storage. Never overwrite server records with local demo data.
4. Run `npm ci` and `npm run build`, then start with the supervisor.
5. Check health, homepage, previous listing/photo, search and a new fictional listing. Verify the actual external URL on another device.

This revision requires no schema migration or deletion. Rollback means restoring previous code and rebuilding; preserve data unless intentionally restoring a backup.

## Demo data

After building, with any normal server stopped:

```sh
npm run demo
```

Six labelled fictional examples are added only if the database is empty. Populated databases are never cleared or reseeded. For a separate demo, choose new private data/upload directories. Do not delete user data for a presentation.

## Verification boundary

Clean installation/build/start and process restart are tested locally on Windows with Node.js 24. This revision was not uploaded to or verified on the remote server. Before wider public use, arrange moderation, data removal, abuse limits and storage monitoring in the existing environment.
