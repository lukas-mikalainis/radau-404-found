# Radau testavimo ir demonstracijos planas

> Pradinis 2026-09-22 dokumentas. Dabartinę 2026-09-24 būseną žr. [PROJECT_PLAN.md](PROJECT_PLAN.md), [ARCHITECTURE.md](ARCHITECTURE.md) ir [TEST_RESULTS.md](TEST_RESULTS.md).

## Automatiniai testai

`npm test` paleidžia tikrą Express serverį atsitiktiniame vietiniame prievade, naudoja laikiną SQLite ir uploads aplanką. Pagrindinė projekto DB neliečiama. Tikrinamas sukūrimas, paieška, filtrai, valdymo kodo slaptumas, neteisėtas ir teisėtas užbaigimas, netinkami laukai / data / failas, nuotraukos perrašymas, 404 ir DB išlikimas.

## Rankinio priėmimo scenarijai

| ID | Veiksmas | Tikėtinas rezultatas |
|---|---|---|
| T01 | Pagrindiniame puslapyje pasirinkti „Pamečiau“ | Forma parenka pamestą tipą |
| T02 | Sukurti su galiojančia nuotrauka | Sėkmės langas, kodas, atsidaro detalės |
| T03 | Praleisti privalomus laukus | Forma neleidžia skelbti |
| T04 | Įkelti >5 MB failą / netikrą JPG | Aiški klaida, skelbimas nesukuriamas |
| T05 | Ieškoti pavadinimo dalies, kategorijos ir vietos | Lieka tik visus filtrus atitinkantys įrašai |
| T06 | Ieškoti neegzistuojančio daikto, išvalyti filtrus | Tuščios būsenos paaiškinimas, sąrašas atsikuria |
| T07 | Atidaryti detalę tiesioginiu URL ir perkrauti | Tas pats skelbimas, nėra maršruto 404 |
| T08 | Kita naršyklė, neteisingas valdymo kodas | Užbaigimas atmetamas |
| T09 | Teisingas kodas | Rodoma „Grąžinta“, skelbimas dingsta iš aktyvių |
| T10 | Pasirinkti grąžintų filtrą | Užbaigtas skelbimas išlieka istorijoje |
| T11 | Perkrauti serverį | Skelbimas ir nuotrauka išlieka |
| T12 | 375 px ekranas, Tab ir Enter | Turinys telpa, laukai ir veiksmai pasiekiami |

## 5 minučių demonstracija

1. Lukas (45 s): problema, auditorija ir SMART tikslas.
2. Aleks (60 s): pradinis puslapis, paieška, kategorijos, telefono vaizdas.
3. Andrej (90 s): naujas skelbimas su nuotrauka, serverio tikrinimas, gautas kodas.
4. Rokas (60 s): netinkamo kodo atmetimas, teisingas užbaigimas, grąžintų sąrašas.
5. Lukas (45 s): darbų pasiskirstymas, testai, likęs planas ir AI kaip vėlesnis etapas.

Demo naudokite išgalvotą kontaktą `studentas@example.invalid`. Neįrašykite tikrų studento pažymėjimo numerių. Iš anksto turėkite vieną JPG ar PNG failą ir išsaugotą valdymo kodą.

Automatinės ir naršyklės patikros rezultatai pateikiami `PATIKROS-REZULTATAI.md`. Studentų naudojamumo tyrimas, kito kompiuterio diegimas ir viešas pilotas dar neatlikti.
