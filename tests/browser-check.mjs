import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { createApp } from "../server/app.js";
const dir = await mkdtemp(path.join(os.tmpdir(), "radau-browser-"));
const { app, db } = createApp({
  dataDir: path.join(dir, "db"),
  uploadDir: path.join(dir, "uploads"),
  seed: true,
});
const server = app.listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const channel =
  process.env.BROWSER_CHANNEL ||
  (process.platform === "win32" ? "msedge" : undefined);
const browser = await chromium.launch({
  ...(channel && { channel }),
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await mkdir("docs/screenshots", { recursive: true });
try {
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.locator(".item-card").first().waitFor();
  await page.screenshot({
    path: "docs/screenshots/desktop.png",
    fullPage: true,
  });
  await page.getByRole("textbox", { name: "Ieškoti daiktų" }).fill("Sony");
  await page.waitForFunction(
    () => document.querySelectorAll(".item-card").length === 1,
  );
  await page
    .getByRole("textbox", { name: "Ieškoti daiktų" })
    .fill("neegzistuojantis");
  await page.getByText("Kol kas nieko neradome").waitFor();
  await page.getByRole("button", { name: "Išvalyti filtrus" }).click();
  await page.waitForFunction(
    () => document.querySelectorAll(".item-card").length === 6,
  );
  await page.getByRole("link", { name: "Pamečiau daiktą" }).click();
  await page.getByRole("button", { name: "Paskelbti skelbimą" }).click();
  await expect(page.getByText("Patikrink pažymėtus laukus.")).toBeVisible();
  await expect(
    page.getByLabel("Daikto pavadinimas", { exact: true }),
  ).toBeFocused();
  await page.screenshot({path:"docs/screenshots/form-validation.png",fullPage:true});
  await page.getByLabel("Daikto pavadinimas").fill("Testo ausinės");
  await page.locator("select[name=category]").selectOption("Elektronika");
  await page.getByLabel("Data", { exact: true }).fill("2026-01-01");
  await page.getByLabel("Vieta", { exact: true }).fill("Testavimo auditorija");
  await page
    .getByLabel("Aprašymas", { exact: true })
    .fill("Tai automatinio naršyklės testo aprašymas.");
  const image = await sharp({
    create: { width: 200, height: 200, channels: 3, background: "#8cab64" },
  })
    .png()
    .toBuffer();
  await page
    .locator("input[type=file]")
    .setInputFiles({ name: "test.png", mimeType: "image/png", buffer: image });
  await page.getByLabel("Kontaktinė informacija").fill("test@example.invalid");
  await page.getByRole("button", { name: "Paskelbti skelbimą" }).click();
  await page.getByText("Skelbimas paskelbtas!").waitFor();
  await page.getByRole("link", { name: "Peržiūrėti skelbimą" }).click();
  await page.getByRole("heading", { name: "Testo ausinės" }).waitFor();
  await expect(page.locator(".detail-image img")).toBeVisible();
  await page.reload();
  await page.getByRole("heading", { name: "Testo ausinės" }).waitFor();
  await page.getByRole("button", { name: "Pažymėti kaip grąžintą" }).click();
  await page.getByText("Daiktas grąžintas. Ačiū už pagalbą!").waitFor();
  await page.screenshot({
    path: "docs/screenshots/detail.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.locator(".item-card").first().waitFor();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({
    path: "docs/screenshots/mobile.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Radau daiktą" }).click();
  await page.getByRole("heading", { name: "Pasidalink skelbimu." }).waitFor();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.getByLabel("Daikto pavadinimas").fill("Rasti testo raktai");
  await page.locator("select[name=category]").selectOption("Raktai");
  await page.getByLabel("Data", { exact: true }).fill("2026-01-02");
  await page.getByLabel("Vieta", { exact: true }).fill("Testo biblioteka");
  await page
    .getByLabel("Aprašymas", { exact: true })
    .fill("Raktai su mėlynu pakabuku.");
  await page.getByLabel("Kontaktinė informacija").fill("demo@example.invalid");
  await page.getByRole("button", { name: "Paskelbti skelbimą" }).click();
  await page.getByRole("link", { name: "Peržiūrėti skelbimą" }).click();
  await expect(page.getByText("Be nuotraukos")).toBeVisible();
  const foundUrl = page.url();
  const token = await page.getByLabel("Skelbimo valdymo kodas").inputValue();
  await page.getByLabel("Skelbimo valdymo kodas").fill("wrong");
  await page.getByRole("button", { name: "Pažymėti kaip grąžintą" }).click();
  await expect(page.getByRole("alert")).toHaveText("Netinkamas valdymo kodas.");
  await page.screenshot({
    path: "docs/screenshots/found-mobile.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "← Visi skelbimai" }).click();
  await page.getByLabel("Kategorija", { exact: true }).selectOption("Raktai");
  await page.getByLabel("Filtruoti pagal vietą").fill("Testo biblioteka");
  await page.getByLabel("Data nuo").fill("2026-01-02");
  await page.getByLabel("Data iki").fill("2026-01-02");
  await expect(page.locator(".item-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".item-card")).toHaveCount(1);
  await page.goto(foundUrl);
  await page.getByLabel("Skelbimo valdymo kodas").fill(token);
  await page.getByRole("button", { name: "Pažymėti kaip grąžintą" }).click();
  await expect(
    page.getByText("Daiktas grąžintas. Ačiū už pagalbą!"),
  ).toBeVisible();
  await page.goto(`http://127.0.0.1:${server.address().port}/?status=returned`);
  await expect(page.locator(".item-card")).toHaveCount(2);
  await page.route("**/api/posts?**", (route) => route.abort());
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await expect(page.getByRole("alert")).toContainText(
    "Nepavyko susisiekti su serveriu",
  );
  await page.unroute("**/api/posts?**");
  await page.getByRole("button", { name: "Bandyti dar kartą" }).click();
  await expect(page.locator(".item-card")).toHaveCount(6);
  await page.route("**/illustrations/keys.svg", (route) => route.abort());
  await page.reload();
  await expect(page.getByText("Nuotrauka nepasiekiama")).toBeVisible();
  await page.unroute("**/illustrations/keys.svg");
  await page.goto(
    `http://127.0.0.1:${server.address().port}/skelbimai/missing`,
  );
  await expect(page.getByRole("alert")).toHaveText("Skelbimas nerastas.");
  await page.goto(
    `http://127.0.0.1:${server.address().port}/nerastas-puslapis`,
  );
  await expect(
    page.getByRole("heading", { name: "Puslapis nerastas" }),
  ).toBeVisible();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: lost + found, optional image, validation, search/date/category/location filters, reload, resolve, wrong code, returned list, mobile, offline retry, broken image, 404, zero page errors.",
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
  db.close();
  await rm(dir, { recursive: true, force: true });
}
