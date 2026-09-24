import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";
import net from "node:net";

test(
  "production process restarts with preserved data and works outside project cwd",
  { skip: !existsSync(new URL("../dist/index.html", import.meta.url)) },
  async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "radau-restart-"));
    const probe = net.createServer().listen(0, "127.0.0.1");
    await once(probe, "listening");
    const port = probe.address().port;
    await new Promise((r) => probe.close(r));
    let child;
    async function start() {
      child = spawn(
        process.execPath,
        [fileURLToPath(new URL("../server/index.js", import.meta.url))],
        {
          cwd: dir,
          env: {
            ...process.env,
            PORT: String(port),
            DATA_DIR: path.join(dir, "data"),
            UPLOAD_DIR: path.join(dir, "uploads"),
            SEED_DEMO: "0",
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      let log = "";
      await new Promise((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Startup timeout " + log)),
          10000,
        );
        child.stdout.on("data", (b) => {
          log += b;
          if (log.includes("Radau:")) {
            clearTimeout(timer);
            resolve();
          }
        });
        child.stderr.on("data", (b) => (log += b));
        child.once("exit", (code) => {
          clearTimeout(timer);
          reject(new Error("Early exit " + code + " " + log));
        });
      });
    }
    async function stop() {
      if (child && child.exitCode === null) {
        const exited = once(child, "exit");
        child.kill("SIGTERM");
        await exited;
      }
    }
    try {
      await start();
      const url = `http://127.0.0.1:${port}`;
      const data = new FormData();
      for (const [k, v] of Object.entries({
        type: "found",
        title: "Testo piniginė",
        description: "Testuojamas duomenų išlikimas po perkrovimo",
        category: "Kita",
        location: "Biblioteka",
        date: "2026-01-01",
        contact: "test@example.invalid",
      }))
        data.set(k, v);
      let r = await fetch(url + "/api/posts", { method: "POST", body: data });
      assert.equal(r.status, 201);
      const { id } = await r.json();
      await stop();
      await start();
      r = await fetch(url + "/api/posts/" + id);
      assert.equal(r.status, 200);
      assert.equal((await r.json()).title, "Testo piniginė");
      r = await fetch(url + "/skelbimai/" + id);
      assert.equal(r.status, 200);
      assert.ok((await r.text()).includes('id="root"'));
    } finally {
      await stop();
      await rm(dir, { recursive: true, force: true });
    }
  },
);
