import { createApp } from "./app.js";
import { existsSync } from "node:fs";

const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("PORT must be an integer between 1 and 65535.");
  process.exit(1);
}
if (
  !existsSync(new URL("../dist/index.html", import.meta.url)) &&
  !process.argv.includes("--dev")
) {
  console.error(
    "Build missing. Run npm ci and npm run build before npm start.",
  );
  process.exit(1);
}
const { app, db } = createApp({
  seed: process.env.SEED_DEMO === "1" || process.argv.includes("--demo"),
  ...(process.env.DATA_DIR && { dataDir: process.env.DATA_DIR }),
  ...(process.env.UPLOAD_DIR && { uploadDir: process.env.UPLOAD_DIR }),
});
const server = app.listen(port, "127.0.0.1", () =>
  console.log(`Radau: http://127.0.0.1:${port}`),
);
server.on("error", (error) => {
  console.error(`Server start failed: ${error.code}`);
  db.close();
  process.exitCode = 1;
});
let closing = false;
function shutdown() {
  if (closing) return;
  closing = true;
  server.close(() => {
    db.close();
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
