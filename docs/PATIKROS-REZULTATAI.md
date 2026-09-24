# Patikros rezultatai · 2026-09-22

> Pradinis 2026-09-22 dokumentas. Dabartinę 2026-09-24 būseną žr. [PROJECT_PLAN.md](PROJECT_PLAN.md), [ARCHITECTURE.md](ARCHITECTURE.md) ir [TEST_RESULTS.md](TEST_RESULTS.md).

Patikrinta Windows aplinkoje su Node.js v24.16.0 ir Microsoft Edge per Playwright.

| Patikra | Rezultatas |
|---|---|
| `npm run build` | Sėkminga, sukurtas `dist/` |
| `npm test` | Sėkmingas vienas integracinis testas su keliomis viso ciklo ir klaidų patikromis |
| `node tests/browser-check.mjs` | Sėkmingas visas naršyklės scenarijus |
| `npm audit` po sharp atnaujinimo | 0 žinomų pažeidžiamumų |
| 1440 px pradinis puslapis | Ekrano vaizdas peržiūrėtas, skelbimų tekstas ir kortelės matomi |
| 375 px pradinis puslapis ir forma | Horizontalaus perpildymo nėra; pradinio puslapio ekrano vaizdas peržiūrėtas |
| Skelbimo detalės po užbaigimo | Ekrano vaizdas peržiūrėtas, būsena „Grąžinta“ |
| Naršyklės JavaScript klaidos testuotame cikle | 0 |

Naršyklės scenarijus patikrino paiešką, tuščius rezultatus, filtrų išvalymą, skelbimo sukūrimą su tikru PNG, valdymo kodo išsaugojimą naršyklėje, tiesioginio detalių URL perkrovimą ir užbaigimą. API scenarijus papildomai tikrino netinkamus tipus, kategoriją, datas, netikrą paveikslą, kodo neatskleidimą, draudimą keisti su netinkamu kodu, paiešką didžiosiomis lietuviškomis raidėmis, filtrus, 404 ir įrašo išlikimą uždarius bei vėl atidarius DB.

Vaizdai: `screenshots/desktop.png`, `screenshots/mobile.png`, `screenshots/detail.png`. Testų įrašai sukurti laikinoje DB ir pašalinti kartu su ja. Pagrindinio prototipo DB turi tik pažymėtus demonstracinius įrašus, kol naudotojas pats sukuria naujų.

Vite išveda React Router `use client` direktyvos ignoravimo perspėjimą. Build ir naršyklės eiga sėkmingi.

Dar nepatikrinta: 5 realių naudotojų tyrimas, pilnas klaviatūros / ekrano skaitytuvo auditas, 100 įrašų našumo matavimas, diegimas kitame kompiuteryje, atsarginės kopijos atkūrimas ir viešas serveris. Šių punktų nelaikome atliktais.
