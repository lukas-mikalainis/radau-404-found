import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { createApp } from "../server/app.js";

test("full lifecycle, validation, image upload, authorization and persistence", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "radau-test-"));
  const config = {
    dataDir: path.join(dir, "data"),
    uploadDir: path.join(dir, "uploads"),
  };
  const { app, db } = createApp(config);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  function form(overrides = {}, image) {
    const f = new FormData();
    for (const [k, v] of Object.entries({
      type: "lost",
      title: "Juodos ausinės",
      description: "Ausinės su baltu lipduku",
      category: "Elektronika",
      location: "SMK biblioteka",
      date: "2026-01-01",
      contact: "test@example.invalid",
      ...overrides,
    }))
      f.set(k, v);
    if (image) f.set("image", image, "photo.png");
    return f;
  }
  try {
    for (const data of [
      { title: "x" },
      { date: "2026-02-30" },
      { date: "2999-01-01" },
      { category: "fake" },
      { type: "returned" },
    ]) {
      const r = await fetch(base + "/api/posts", {
        method: "POST",
        body: form(data),
      });
      assert.equal(r.status, 400);
    }
    let r = await fetch(base + "/api/posts", {
      method: "POST",
      body: form({}, new Blob(["not an image"], { type: "image/png" })),
    });
    assert.equal(r.status, 400);
    const png = await sharp({
      create: { width: 30, height: 30, channels: 3, background: "#123456" },
    })
      .png()
      .toBuffer();
    r = await fetch(base + "/api/posts", {
      method: "POST",
      body: form({}, new Blob([png], { type: "image/png" })),
    });
    assert.equal(r.status, 201);
    const { id, manageToken } = await r.json();
    assert.ok(manageToken.length >= 40);
    r = await fetch(base + "/api/posts/" + id);
    const item = await r.json();
    assert.equal(item.title, "Juodos ausinės");
    assert.ok(item.image.endsWith(".webp"));
    assert.equal(item.manage_hash, undefined);
    assert.equal(item.manageToken, undefined);
    r = await fetch(base + item.image);
    assert.equal(r.status, 200);
    assert.equal(
      (await sharp(Buffer.from(await r.arrayBuffer())).metadata()).format,
      "webp",
    );
    r = await fetch(
      base +
        "/api/posts?q=" +
        encodeURIComponent("AUSINĖS") +
        "&category=Elektronika&location=SMK&type=lost&status=active",
    );
    assert.equal((await r.json()).length, 1);
    r = await fetch(base + "/api/posts?type=found");
    assert.equal((await r.json()).length, 0);
    for (const token of ["", "wrong"]) {
      r = await fetch(base + "/api/posts/" + id + "/resolve", {
        method: "PATCH",
        headers: { Authorization: "Bearer " + token },
      });
      assert.equal(r.status, 403);
    }
    r = await fetch(base + "/api/posts/" + id + "/resolve", {
      method: "PATCH",
      headers: { Authorization: "Bearer " + manageToken },
    });
    assert.equal(r.status, 200);
    r = await fetch(base + "/api/posts?status=active");
    assert.equal((await r.json()).length, 0);
    r = await fetch(base + "/api/posts?status=returned");
    assert.equal((await r.json())[0].type, "lost");
    r = await fetch(base + "/api/posts/missing");
    assert.equal(r.status, 404);
    db.close();
    const reopened = createApp(config);
    assert.equal(
      reopened.db.prepare("SELECT status FROM posts WHERE id=?").get(id).status,
      "returned",
    );
    reopened.db.close();
  } finally {
    await new Promise((r) => server.close(r));
    try {
      db.close();
    } catch {}
    await rm(dir, { recursive: true, force: true });
  }
});

test("found without photo, combined date filters and malformed requests", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "radau-input-"));
  const { app, db } = createApp({
    dataDir: path.join(dir, "db"),
    uploadDir: path.join(dir, "uploads"),
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const url = `http://127.0.0.1:${server.address().port}`;
  function form() {
    const f = new FormData();
    for (const [k, v] of Object.entries({
      type: "found",
      title: "Rasti raktai",
      description: "Rasti raktai su mėlynu pakabuku",
      category: "Raktai",
      location: "Biblioteka",
      date: "2026-01-02",
      contact: "demo@example.invalid",
    }))
      f.set(k, v);
    return f;
  }
  try {
    let r = await fetch(url + "/api/posts", { method: "POST", body: form() });
    assert.equal(r.status, 201);
    const created = await r.json();
    r = await fetch(url + "/api/posts/" + created.id);
    assert.equal((await r.json()).image, null);
    r = await fetch(
      url +
        "/api/posts?type=found&category=Raktai&location=biblioteka&from=2026-01-02&to=2026-01-02&q=" +
        encodeURIComponent("MĖLYNU"),
    );
    assert.equal((await r.json()).length, 1);
    r = await fetch(url + "/api/posts?from=2026-01-03");
    assert.equal((await r.json()).length, 0);
    for (const query of [
      "from=2026-02-30",
      "from=2026-01-03&to=2026-01-01",
      "type=bad",
      "q=a&q=b",
    ]) {
      r = await fetch(url + "/api/posts?" + query);
      assert.equal(r.status, 400);
      assert.ok((await r.json()).error);
    }
    r = await fetch(url + "/api/posts", { method: "POST" });
    assert.equal(r.status, 415);
    r = await fetch(url + "/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"bad":',
    });
    assert.equal(r.status, 400);
    assert.ok(!(await r.text()).includes("SyntaxError"));
    r = await fetch(url + "/api/posts", {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data" },
      body: "broken",
    });
    assert.equal(r.status, 400);
    r = await fetch(url + "/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: "a".repeat(20000) }),
    });
    assert.equal(r.status, 413);
    let f = form();
    f.append("title", "duplicate");
    r = await fetch(url + "/api/posts", { method: "POST", body: f });
    assert.equal(r.status, 400);
    assert.ok((await r.json()).fields.title);
    f = form();
    f.set(
      "image",
      new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: "image/png" }),
      "too-big.png",
    );
    r = await fetch(url + "/api/posts", { method: "POST", body: f });
    assert.equal(r.status, 400);
    f = form();
    f.set(
      "image",
      new Blob(
        [
          '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>alert(1)</script></svg>',
        ],
        { type: "image/jpeg" },
      ),
      "fake.jpg",
    );
    r = await fetch(url + "/api/posts", { method: "POST", body: f });
    assert.equal(r.status, 400);
    for (const target of [
      "/uploads/missing.webp",
      "/uploads/00000000-0000-0000-0000-000000000000.webp",
      "/uploads/%2e%2e%2fpackage.json",
      "/.env",
    ]) {
      r = await fetch(url + target);
      assert.equal(r.status, 404);
      assert.ok(!(r.headers.get("content-type") || "").includes("text/html"));
    }
    assert.equal((await readdir(path.join(dir, "uploads"))).length, 0);
    r = await fetch(url + "/api/health");
    assert.equal(r.status, 200);
    assert.equal(
      db.prepare("SELECT count(*) AS count FROM posts").get().count,
      1,
    );
  } finally {
    await new Promise((r) => server.close(r));
    db.close();
    await rm(dir, { recursive: true, force: true });
  }
});
