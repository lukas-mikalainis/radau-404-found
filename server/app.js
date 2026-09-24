import express from "express";
import multer from "multer";
import sharp from "sharp";
import { DatabaseSync } from "node:sqlite";
import {
  randomBytes,
  randomUUID,
  createHash,
  timingSafeEqual,
} from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { writeFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { categories, validDate, validatePost } from "../shared/listings.js";

export { categories };
const root = fileURLToPath(new URL("../", import.meta.url));
const hash = (value) => createHash("sha256").update(value).digest("hex");
const publicFields =
  "id,type,title,description,category,location,date,contact,image,status,is_demo,created_at";
export function createApp({
  dataDir = path.join(root, "data"),
  uploadDir = path.join(root, "uploads"),
  seed = false,
} = {}) {
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(uploadDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "radau.sqlite"));
  db.exec("PRAGMA journal_mode=WAL");
  db.exec("PRAGMA busy_timeout=5000");
  db.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
  const insert = db.prepare(
    "INSERT INTO posts(id,type,title,description,category,location,date,contact,image,manage_hash,is_demo) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
  );
  if (seed && !db.prepare("SELECT id FROM posts LIMIT 1").get()) {
    const examples = [
      [
        "lost",
        "Juodos Sony ausinės",
        "Palikau po paskaitos. Ant dėklo yra mažas baltas lipdukas.",
        "Elektronika",
        "SMK · II aukštas",
        "headphones",
      ],
      [
        "found",
        "Raktai su žaliu pakabuku",
        "Rasti prie bibliotekos. Atsiimant paprašysime apibūdinti pakabuką.",
        "Raktai",
        "SMK · Biblioteka",
        "keys",
      ],
      [
        "found",
        "Smėlio spalvos kuprinė",
        "Kuprinę perdaviau registratūros darbuotojams.",
        "Krepšiai",
        "SMK · Registratūra",
        "bag",
      ],
      [
        "lost",
        "Mėlyna gertuvė",
        "Metalinė gertuvė su juodu dangteliu.",
        "Kita",
        "SMK · 204 auditorija",
        "bottle",
      ],
      [
        "found",
        "Pilkas džemperis",
        "Paliktas ant suoliuko prie pagrindinio įėjimo.",
        "Drabužiai",
        "SMK · I aukštas",
        "shirt",
      ],
      [
        "lost",
        "USB-C įkroviklis",
        "Baltas nešiojamojo kompiuterio įkroviklis.",
        "Elektronika",
        "SMK · Skaitykla",
        "charger",
      ],
    ];
    for (const [type, title, description, category, location, art] of examples)
      insert.run(
        randomUUID(),
        type,
        title,
        description,
        category,
        location,
        "2026-09-21",
        "demo@example.invalid",
        `/illustrations/${art}.svg`,
        hash(randomBytes(32).toString("hex")),
        1,
      );
  }
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' blob: data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    );
    next();
  });
  app.use(express.json({ limit: "10kb" }));
  app.use(
    "/uploads",
    (req, res, next) => {
      if (!/^\/[a-f0-9-]{36}\.webp$/.test(req.path))
        return res.status(404).end();
      next();
    },
    express.static(path.resolve(uploadDir), { dotfiles: "deny" }),
    (_req, res) => res.status(404).end(),
  );
  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/categories", (_req, res) => res.json(categories));
  app.get("/api/posts", (req, res) => {
    for (const key of [
      "type",
      "category",
      "status",
      "q",
      "location",
      "from",
      "to",
    ]) {
      if (
        req.query[key] !== undefined &&
        (typeof req.query[key] !== "string" || req.query[key].length > 200)
      )
        return res.status(400).json({ error: "Netinkami paieškos filtrai." });
    }
    for (const [key, allowed] of Object.entries({
      type: ["lost", "found"],
      category: categories,
      status: ["active", "returned"],
    })) {
      if (req.query[key] && !allowed.includes(req.query[key]))
        return res
          .status(400)
          .json({ error: "Pasirink galiojantį paieškos filtrą." });
    }
    const { from, to } = req.query;
    if (
      (from && !validDate(from)) ||
      (to && !validDate(to)) ||
      (from && to && from > to)
    )
      return res.status(400).json({
        error:
          "Patikrink datų intervalą: pradžia negali būti vėlesnė už pabaigą.",
      });
    const filters = [];
    const args = [];
    if (from) {
      filters.push("date >= ?");
      args.push(from);
    }
    if (to) {
      filters.push("date <= ?");
      args.push(to);
    }
    for (const key of ["type", "category", "status"])
      if (req.query[key]) {
        filters.push(`${key} = ?`);
        args.push(String(req.query[key]));
      }
    let rows = db
      .prepare(
        `SELECT ${publicFields} FROM posts ${filters.length ? "WHERE " + filters.join(" AND ") : ""} ORDER BY created_at DESC, id DESC`,
      )
      .all(...args);
    for (const key of ["q", "location"])
      if (req.query[key]) {
        const term = String(req.query[key]).trim().toLocaleLowerCase("lt");
        rows = rows.filter((p) =>
          (key === "location"
            ? p.location
            : `${p.title} ${p.description} ${p.location}`
          )
            .toLocaleLowerCase("lt")
            .includes(term),
        );
      }
    res.json(rows);
  });
  app.get("/api/posts/:id", (req, res) => {
    const post = db
      .prepare(`SELECT ${publicFields} FROM posts WHERE id=?`)
      .get(req.params.id);
    post
      ? res.json(post)
      : res.status(404).json({ error: "Skelbimas nerastas." });
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1,
      fields: 8,
      fieldSize: 8000,
      parts: 9,
    },
  });
  app.post(
    "/api/posts",
    (req, res, next) => {
      if (!req.is("multipart/form-data"))
        return res
          .status(415)
          .json({ error: "Skelbimą pateik per skelbimo formą." });
      next();
    },
    upload.single("image"),
    async (req, res, next) => {
      let savedImage;
      try {
        const b = req.body || {};
        const errors = validatePost(b);
        if (Object.keys(errors).length)
          return res
            .status(400)
            .json({ error: Object.values(errors)[0], fields: errors });
        let image = null;
        if (req.file) {
          let converted;
          try {
            const source = sharp(req.file.buffer, {
              limitInputPixels: 25000000,
            });
            const meta = await source.metadata();
            if (!["jpeg", "png", "webp"].includes(meta.format))
              throw new Error();
            converted = await source
              .rotate()
              .resize(1400, 1400, { fit: "inside", withoutEnlargement: true })
              .webp({ quality: 82 })
              .toBuffer();
          } catch {
            return res
              .status(400)
              .json({ error: "Įkelkite tikrą JPG, PNG arba WebP nuotrauką." });
          }
          const name = randomUUID() + ".webp";
          savedImage = path.join(uploadDir, name);
          await writeFile(savedImage, converted, { flag: "wx" });
          image = "/uploads/" + name;
        }
        const id = randomUUID();
        const manageToken = randomBytes(24).toString("hex");
        insert.run(
          id,
          b.type,
          b.title.trim(),
          b.description.trim(),
          b.category,
          b.location.trim(),
          b.date,
          b.contact.trim(),
          image,
          hash(manageToken),
          0,
        );
        res.status(201).json({ id, manageToken });
      } catch (error) {
        // Remove only the new file from this failed request, never an existing listing.
        if (savedImage) await unlink(savedImage).catch(() => {});
        next(error);
      }
    },
  );
  app.patch("/api/posts/:id/resolve", (req, res) => {
    const post = db
      .prepare("SELECT manage_hash FROM posts WHERE id=?")
      .get(req.params.id);
    if (!post) return res.status(404).json({ error: "Skelbimas nerastas." });
    const token = req.get("authorization")?.replace(/^Bearer /, "") || "";
    if (
      !timingSafeEqual(Buffer.from(hash(token)), Buffer.from(post.manage_hash))
    )
      return res.status(403).json({ error: "Netinkamas valdymo kodas." });
    db.prepare("UPDATE posts SET status='returned' WHERE id=?").run(
      req.params.id,
    );
    res.json({ status: "returned" });
  });
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "API adresas nerastas." }),
  );
  app.use(express.static(path.join(root, "dist")));
  app.get("/{*path}", (req, res, next) => {
    if (
      path.extname(req.path) ||
      req.path.split("/").some((part) => part.startsWith("."))
    )
      return res.status(404).end();
    res.sendFile("index.html", { root: path.join(root, "dist") }, (error) => {
      if (error) next(error);
    });
  });
  app.use((err, _req, res, _next) => {
    if (res.headersSent) return _next(err);
    if (err.type === "entity.parse.failed")
      return res
        .status(400)
        .json({ error: "Netaisyklingi užklausos duomenys." });
    if (err.type === "entity.too.large")
      return res.status(413).json({ error: "Pateikta per daug duomenų." });
    if (err instanceof multer.MulterError)
      return res.status(400).json({
        error:
          err.code === "LIMIT_FILE_SIZE"
            ? "Nuotrauka turi būti iki 5 MB."
            : "Patikrink formą: leidžiama viena nuotrauka ir tik nurodyti laukai.",
      });
    if (err.status >= 400 && err.status < 500)
      return res
        .status(err.status)
        .json({ error: "Nepavyko perskaityti užklausos. Patikrink formą." });
    if (
      err.message === "Unexpected end of form" ||
      err.message === "Multipart: Boundary not found"
    )
      return res
        .status(400)
        .json({ error: "Nepavyko įkelti formos. Bandyk dar kartą." });
    console.error("[Radau] Request failed:", err.stack);
    res.status(500).json({ error: "Serverio klaida. Bandykite dar kartą." });
  });
  return { app, db };
}
