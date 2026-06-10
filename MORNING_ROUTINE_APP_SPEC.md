# Reggeli Rutin App — Fejlesztői Specifikáció

> Vizuális feladatkövető tablet-app gyerekeknek. Cél: a reggeli (és egyéb napszaki) készülődés "vészhelyzeti üzemmódjának" oldása azzal, hogy a gyerek mindig csak a következő feladatot látja, nem az egész teendőhalmazt.

**Verzió:** 0.2 (spec) · **Nyelv:** publikus, többnyelvű (i18n) · **Platform:** tablet-első, böngészős

---

## 1. Termékelvek (nem megszeghető)

1. **Csak vizualizáció, nincs hang.** Semmilyen hangjelzés, csengő, beszéd.
2. **Csak pozitív vagy semleges visszajelzés.** Soha nincs negatív/szomorú jelzés, piros riasztás, kudarcélmény. Túlfutott időkeret = semleges állapot, nem büntetés.
3. **Egy feladat egyszerre.** A soron következő feladat mindig kiemelt, hogy a gyereknek ne kelljen választania.
4. **Teljesen testreszabható, univerzális.** Gyerekek száma, nevek, jelek, ikonok, időszakok, feladatok — minden konfigurálható, hardkódolt tartalom nélkül.
5. **Offline-first.** Telepítés és hálózat nélkül működik (böngésző, kiosk-mód). Adat lokálisan.

---

## 2. Célközönség és kontextus

- Több gyerekes családok (példa: 4 fő — bölcsi, ovi, suli korosztály).
- Felhasználó a gyerek (érintés), konfigurál a szülő.
- Kiemelt másodlagos célcsoport: neurodivergens (ADHD/autizmus) gyerekek, akiknél a vizuális ütemezés és az egy-feladat-fókusz bizonyítottan segít. A pozitív-csak elv ezért is kötelező.

---

## 3. Technológiai javaslat

| Réteg | Javaslat | Indok |
|---|---|---|
| Váz | Vanilla HTML/CSS/JS **vagy** Vite + lightweight keretrendszer (Svelte/Preact) | Offline, könnyű, store nélkül futtatható; Svelte kis bundle |
| Tárolás | `IndexedDB` (config + statisztika), fallback `localStorage` | Strukturált, sok rekord (napi logok) jól fér el |
| Megjelenítés | PWA (manifest + service worker) | Telepíthető tabletre, offline cache, teljes képernyő |
| Időzítő | `requestAnimationFrame` + abszolút időbélyeg | Pontos marad háttérbe váltás/újratöltés után is |
| Ikonok | **Phosphor Icons** (tevékenységek) + **OpenMoji** (ovis jelek) — SVG sprite, offline | Egységes stílus, MIT/CC BY-SA, `currentColor`-ral színezhető, méretfüggetlen |
| i18n | JSON nyelvi fájlok (`hu`, `en`, …) | Publikus kiadáshoz |

> Megjegyzés: a tortaszelet-időzítőt SVG `stroke-dasharray` animációval vagy `conic-gradient`-tel a legegyszerűbb és legsimább megvalósítani.

---

## 4. Fő nézetek

### 4.1 Rutin nézet (fő képernyő)
- Felül napszak/időszak jelző (pl. "Hétköznap reggel") + aktuális idő.
- Vízszintesen N oszlop, gyerekenként egy:
  - **Oszlopfej:** a gyerek jele (avatar/szín/emoji/kép) + neve.
  - **Feladat-ikonok** függőlegesen, az adott időszak feladatlistája szerint.
  - Minden ikon státusza: `függőben` / `folyamatban` (tortaszelet) / `kész`.
- **Soron következő feladat** vizuálisan kiemelve (keret/pulzálás — finom, nem stresszes).
- **Alsó összesítő sáv** gyerekenként: az időkerethez viszonyított haladás (időkereten belül / túl — semleges színkóddal, pl. zöld / borostyán, sosem piros).

### 4.2 Konfiguráció nézet (szülői)
- Gyerekek kezelése (hozzáadás/törlés/sorrend, név, jel, szín).
- Feladatkönyvtár (saját feladatok ikonnal + alapértelmezett keretidővel).
- Időszakok és menetrendek (lásd 6.).
- Nyelv, téma.
- Adat export/import (JSON), reset.
- *Opcionális* egyszerű szülői zár (PIN) a konfig elrejtésére a gyerek elől.

### 4.3 Statisztika nézet
- Napi / heti / időszaki összesítő.
- "Ki volt a legügyesebb" — gyerekenkénti teljesítés (befejezett feladatok aránya, időkereten belül teljesítettek száma).
- Trend grafikon (egyszerű oszlop/vonal).

---

## 5. Adatmodell (vázlat)

```jsonc
// Gyerek
{
  "id": "uuid",
  "name": "Bence",
  "marker": { "type": "emoji|color|image", "value": "🦊" },
  "order": 0
}

// Feladat-sablon (könyvtár)
{
  "id": "uuid",
  "label": "Fogmosás",
  "icon": {
    "source": "phosphor",   // "phosphor" | "openmoji"
    "key": "tooth"          // ikonkulcs az adott készletből
  },
  "defaultDurationSec": 120
}

// Ikon-metaadat (az ikonválasztóhoz — nem perzisztált, build-time generált)
{
  "source": "phosphor",
  "key": "tooth",
  "label": { "hu": "Fogmosás", "en": "Tooth" },
  "categories": ["activity", "morning"],  // ikonválasztó szűrőhöz
  "popular": true                          // előre sorolandó a választóban
}

// Időszak (period) — mikor melyik feladatlista érvényes
{
  "id": "uuid",
  "name": "Hétköznap reggel",
  "schedule": {
    "type": "weekly",        // weekly | weekend | oneoff
    "days": [1,2,3,4,5],     // 1=hétfő … 7=vasárnap
    "fromTime": "06:30",
    "toTime": "08:00"
  },
  "tasks": [
    { "taskId": "uuid", "durationSec": 120, "perChild": true }
  ]
}

// Egyszeri esemény
{
  "id": "uuid",
  "name": "Úszás csomagolás",
  "schedule": { "type": "oneoff", "date": "2026-06-10", "fromTime": "17:00" },
  "tasks": [ /* … */ ]
}

// Napi teljesítési log (statisztikához)
{
  "id": "uuid",
  "date": "2026-06-07",
  "periodId": "uuid",
  "childId": "uuid",
  "taskId": "uuid",
  "status": "done|skipped|pending",
  "startedAt": 1717740000000,
  "completedAt": 1717740090000,
  "withinTimeframe": true
}
```

---

## 6. Időszakok és menetrend logika

- **Időszaktípusok:** hétköznap reggel / délután / este, hétvége (külön), egyszeri esemény.
- Az app az **aktuális dátum + idő** alapján választja ki az érvényes időszakot és tölti be annak feladatlistáját.
- Több illeszkedő időszak esetén prioritás: `oneoff` > `weekend`/`weekly` legszűkebb időablak.
- Ha nincs aktív időszak: semleges "nincs most teendő" képernyő (nem üres, nem riasztó).
- Feladat keretideje időszakonként felülírható (a sablon `defaultDurationSec`-jétől eltérhet, pl. a bölcsisnek hosszabb).

---

## 7. Feladat-interakció (állapotgép)

```
pending ──(koppintás)──> running ──(koppintás)──> done
                            │
                            └──(keretidő lejár)──> running (semleges "túlfutott" jelzés, de NEM kész)
```

- **pending:** halvány ikon.
- **running:** tortaszelet-animáció (fogyó kör), finom kiemelés. Lejáratkor a kör semleges állapotba vált (pl. szürke/borostyán), az időzítő tovább futhat vagy megáll — *konfigurálható*, alapból megáll a kör tele/semleges állapotban.
- **done:** kipipált/mosolygós ikon, kis pozitív mikroanimáció (egyszeri, finom).
- Visszavonás: hosszú nyomás `done` → `pending` (gyerek félrenyomás esetére).

---

## 8. Statisztika és "legügyesebb"

- **Metrikák:** befejezett feladatok aránya, időkereten belül teljesített feladatok száma, sorozat (streak).
- **Aggregáció:** napi → heti → időszaki (pl. utolsó 30 nap).
- **"Legügyesebb":** pozitív keretezés — mindig dicséret, sosem rangsoroló megszégyenítés. Pl. "Heti csillagok" mindenkinek a saját fejlődéséhez mérten is, nem csak abszolút sorrend.
- Az adat lokális; semmi nem megy ki a hálózatra (privacy by design — gyerekadat).

---

## 9. UI / UX részletek

- **Tablet-első:** nagy érintőcélpontok (min. 48×48 px), fekvő tájolás alap.
- **Mozgás:** a *futó* időzítő legyen nyugodt, nem stresszes; a kész-animáció a fő öröm-pillanat.
- **Kontraszt és olvashatóság** gyerekszemnek; ikon + felirat együtt (nem csak ikon).
- **Akadálymentesség:** színen túli állapotjelzés (forma/pipa), elég nagy szövegméret.
- Téma: világos/sötét; egyedi, nem geneikus paletta (kerülni az AI-szerű lila-gradient/fehér klisét).

---

## 10. Ikonkészlet és ikonválasztó

### 10.1 Ajánlott ikonforrások

| Forrás | Szerep | Licenc | npm csomag |
|---|---|---|---|
| **[Phosphor Icons](https://phosphoricons.com)** | Tevékenységikonok (fogmosás, öltözés, bepakolás, reggeli…) | MIT | `@phosphor-icons/core` |
| **[OpenMoji](https://openmoji.org)** | Ovis/azonosítójelek (lufi, vonat, lepke, autó…) | CC BY-SA 4.0 | manuális SVG letöltés |

**Miért ez a kombináció?**
- Mindkettő SVG → vektoros, méretfüggetlen, `currentColor`-ral vagy CSS-sel tetszőlegesen színezhető.
- Mindkettő offline elérhető (sprite-ba bundlölve, nincs CDN-függés).
- A Phosphor `fill` súlya tömör, gyerekbarát; az OpenMoji eleve nagy, teli, expresszív stílusú.
- Az eltérő stílus szerepenként következetes: Phosphor = feladatikon, OpenMoji = gyerekjel.

**Phosphor ikonok ajánlott súlya:** `fill` (tömör, könnyen felismerhető kisebb méretben is).

**OpenMoji integrálás:** az SVG fájlokat a repo `/src/icons/openmoji/` mappájába commitolni; build-time sprite-ba összefűzni. A `color` és `black` variáns is elérhető — a black javasolt (CSS-ből színezhető), a color csak ott ahol az eredeti szín az info (pl. zászlók).

### 10.2 Ikonválasztó UX (konfiguráció nézetben)

Az ikonválasztó (feladathoz vagy gyerekjelhez ikon rendelésekor) a teljes egyesített készletben keres/böngész. Nagy ikonszámnál az elveszés elkerülésére:

**Megjelenítési sorrend:**
1. `popular: true` ikonok — "Gyorsan megtalálod" szekció, rácsnézetben előre.
2. Kategória-szűrők (fül/chip) — pl. "Reggel", "Sport", "Jelek", "Étel", "Iskola".
3. Szabad szöveges keresés — az ikon `label` mezőiben (lokalizált kulcsszavak).

**Ikonválasztó adatstruktúra** (build-time generált JSON, nem IndexedDB):
```jsonc
// /src/icons/icon-registry.json
[
  {
    "source": "phosphor",
    "key": "tooth",
    "weight": "fill",
    "labels": { "hu": ["fogmosás", "fogkefe"], "en": ["tooth", "toothbrush"] },
    "categories": ["morning", "activity"],
    "popular": true
  },
  {
    "source": "phosphor",
    "key": "backpack",
    "weight": "fill",
    "labels": { "hu": ["hátizsák", "bepakolás", "iskolatáska"], "en": ["backpack", "bag"] },
    "categories": ["school", "morning"],
    "popular": true
  },
  {
    "source": "openmoji",
    "key": "1F98B",          // unicode codepoint = fájlnév
    "labels": { "hu": ["lepke"], "en": ["butterfly"] },
    "categories": ["marker", "nature"],
    "popular": true
  }
  // …
]
```

**Popular ikonok javasolt listája (kiindulónak):**

*Tevékenységek (Phosphor fill):*
`tooth` (fogmosás), `fork-knife` (reggeli/étkezés), `backpack` (bepakolás), `t-shirt` (öltözés), `sneaker` (cipőfűzés), `shower` (mosdás/fürdés), `bed` (lefekvés), `sun` (felkelés), `coffee` (reggeli ital), `book-open` (olvasás/házi), `pencil` (írás), `bus` (iskolabusz), `bicycle` (biciklizés), `soccer-ball` (sport), `paint-brush` (rajz/kézműves)

*Ovis jelek (OpenMoji):*
🎈 lufi, 🚗 autó, 🚂 vonat, 🦋 lepke, 🌸 virág, ⭐ csillag, 🐸 béka, 🐶 kutya, 🐱 macska, 🍎 alma, 🌈 szivárvány, ⚽ foci, 🎠 körhinta, 🏠 ház, 🌙 hold

### 10.3 Sprite-generálás (build step)

```
/scripts/build-icon-sprite.js
  → olvassa a icon-registry.json-t
  → összefűzi a hivatkozott SVG-ket egy sprites.svg fájlba (<symbol id="phosphor-tooth"> stb.)
  → generálja az icon-registry.json-t (ha manuálisan karbantartott lista alapján dolgozik)
```

Használat a kódban:
```html
<svg class="task-icon"><use href="/icons/sprites.svg#phosphor-tooth" /></svg>
```
CSS-ből: `color`, `width`, `height` szabadon állítható.

---

## 11. Publikus kiadásra (open source)

- **Licenc:** javaslat MIT (engedékeny, közösségbarát). Megjegyzés: az OpenMoji ikonok CC BY-SA 4.0 feltételűek — a README-ben attribution szükséges.
- **README:** screenshotok, gyors indítás, konfig leírás, i18n közreműködési útmutató.
- **i18n:** minden felhasználói szöveg nyelvi JSON-ból; alap `hu` + `en`.
- **Nincs tracker, nincs analytics, nincs külső CDN-függés** (helyi assetek — összhangban a stabil, önhostolt elveddel).
- **Repo struktúra javaslat:**
  ```
  /src
    /views        (routine, config, stats)
    /components   (TaskTile, TimerRing, ChildColumn, SummaryBar, IconPicker)
    /data         (store: IndexedDB wrapper)
    /i18n         (hu.json, en.json)
    /icons
      /phosphor   (SVG fájlok)
      /openmoji   (SVG fájlok)
      icon-registry.json
      sprites.svg (build output)
  /scripts
    build-icon-sprite.js
  /public         (manifest.json, sw.js, icons)
  README.md
  LICENSE
  ```

---

## 12. Fejlesztési fázisok (javaslat)

1. **MVP:** egy fix időszak, N gyerek oszlop, feladat-állapotgép, tortaszelet-időzítő, alsó összesítő. LocalStorage.
2. **Konfiguráció:** gyerek- és feladatkezelés UI, export/import.
3. **Időszakok/menetrend:** hétköznap/hétvége/egyszeri, automatikus kiválasztás.
4. **Statisztika:** napi/heti/időszaki, "legügyesebb".
5. **PWA + i18n + téma:** telepíthetőség, offline, nyelvek, sötét mód.
6. **Kiadás:** README, licenc, screenshotok, demo adat.

---

## 13. Nyitott kérdések (döntésre fejlesztés előtt)

- Tortaszelet lejárat után: megáll vagy túlfut (számolja a túllépést a statisztikához)? *Alap: megáll, de log withinTimeframe=false.*
- "Legügyesebb" mennyire kompetitív vs. mindenki-saját-fejlődése? *Javaslat: hangsúly a pozitív, ne a rangsor.*
- Szülői PIN kell-e az MVP-be? *Javaslat: nem, később.*
- Keretrendszer: vanilla vs. Svelte/Preact? *Javaslat: ha Copilottal gyors iteráció a cél, vanilla + Vite is bőven elég az MVP-hez.*
