# Analiza site + propuneri de îmbunătățire — 2026-08-29

Astea sunt doar **propuneri**, nimic nu e încă implementat. Am analizat codul tuturor celor 3 pagini (`index.html`, `daikin.html`, `value.html`), imaginile din `assets/`, și ce nu există (SEO, analytics, etc.). Le discutăm, îmi spui pe care le vrei și în ce ordine, și le implementez.

Le-am grupat pe zone, în ordinea în care aș prioritiza eu — dar decizia e a ta.

---

## 1. Performanță — cel mai mare impact, cel mai ușor de măsurat

### 1.1 Tailwind rulează live în browser, nu e compilat (prioritate mare)

Momentan folosim Tailwind Play CDN (`<script src="https://cdn.tailwindcss.com">`) — practic, fiecare vizitator descarcă un framework JS de ~300-400KB și browser-ul lui *compilează* CSS-ul pe loc, la fiecare încărcare de pagină. Tailwind însuși afișează un warning în consolă că asta „should not be used in production". Are 3 costuri reale:

- **FOUC** (flash of unstyled content) — o fracțiune de secundă în care pagina apare fără stiluri, până rulează JS-ul.
- Cost de CPU/JS pe fiecare navigare — nu doar prima dată, ci de fiecare dată când treci de pe `index.html` pe `daikin.html`, de exemplu.
- CSS-ul nu e "purjat" (unused classes removed) — livrăm tot motorul, nu doar clasele pe care chiar le folosim.

**Propunere:** trecem la Tailwind CLI — rămânem 100% zero-build în sensul că nu introducem React/webpack/npm-la-fiecare-deploy, dar rulăm o singură comandă (`npx tailwindcss -o assets/site.css --minify`) care generează un fișier CSS static, purjat, pe care îl includem cu un `<link rel="stylesheet">` normal. Se regenerează doar când schimbăm clase noi — un pas în plus la deploy, dar unul singur, ușor de documentat/scriptat. Rezultat: pagina se randează instant cu stilurile corecte, fără JS de compilat, fișier de ~10-15KB în loc de ~300KB+.

### 1.2 Imagini: nesemnate ca dimensiune reală vs. cât se afișează (prioritate mare)

Am verificat rezoluțiile reale vs. cât se văd pe pagină. Exemple concrete:

- `daikin-perfera-f-console.jpg` (cardul "Unități Consolă/Parapet"): **3307×2130px, 740KB** — se afișează într-un card de câteva sute de pixeli lățime. E o poză de 8K practic servită ca thumbnail.
- Logo-urile din marquee (`logo-carrier.png` etc.): unele au 750×300px nativ și 100-150KB fiecare — se afișează la 32-40px înălțime în marquee. Sunt livrate la ~8-10x mai mare decât au nevoie.
- Nu există `srcset`/`sizes` pe nicio imagine — cineva de pe telefon din Tulcea sau Vaslui, posibil pe 4G, descarcă exact aceeași imagine ca cineva pe monitor desktop.

**Propunere:** redimensionez + recomprim toate imaginile din `assets/` la dimensiunile reale de afișare (cu un multiplicator 2x pentru ecrane retina), convertesc unde are sens la WebP (suport universal azi, ~25-35% mai mic decât JPEG la aceeași calitate vizuală). Estimare: probabil tăiem 60-80% din greutatea totală a imaginilor site-ului, ceea ce contează mult pentru vizitatorii de pe mobil/conexiuni mai slabe — exact publicul din zonele mai puțin urbane pe care le targetezi (Vrancea, Ialomița, Tulcea, Vaslui).

### 1.3 Lipsă `loading="lazy"` pe majoritatea imaginilor

Din 38 de tag-uri `<img>` în `index.html`, doar 2 au `loading="lazy"`. Restul (cardurile de servicii, portofoliul, marquee-ul de logo-uri) se încarcă imediat, chiar dacă sunt sub fold și concurează pentru bandwidth cu imaginea din hero (care e cea care contează pentru LCP — metrica de "cât de repede pare că s-a încărcat pagina").

**Propunere:** adaug `loading="lazy"` pe toate imaginile de sub primul ecran vizibil (păstrăm eager doar hero-ul, care oricum e background-image CSS, nu `<img>`).

### 1.4 Font Awesome complet, pentru 25 de iconițe folosite

Includem tot `all.min.css` de la Font Awesome (mii de iconițe + fonturi), dar folosim în total 25 de iconițe distincte pe tot site-ul.

**Propunere:** fie trecem pe un Font Awesome Kit subsetat (doar iconițele folosite), fie — și mai rapid — le înlocuim cu SVG inline pentru cele 25 folosite. A doua variantă elimină complet o dependență externă și e cea mai rapidă de încărcat.

---

## 2. SEO / vizibilitate în căutări — momentan lipsă aproape completă

### 2.1 Fără date structurate (JSON-LD LocalBusiness)

Momentan Google nu are niciun semnal structurat că sunteți o firmă locală cu adresă, program, telefon, rating. Fără asta, pierdeți șansa la rich results (cutia aia cu stele, adresă, buton de sunat, care apare direct în căutare) și la o parte din SEO local.

**Propunere:** adaug un bloc `<script type="application/ld+json">` de tip `LocalBusiness`/`HVACBusiness` cu adresa, telefonul, programul, rating-ul (4.8/11), zona de acoperire (Brăila, Galați etc.) — pe toate 3 paginile. E text pur, zero risc, impact real pe termen mediu la SEO local.

### 2.2 Fără `sitemap.xml` / `robots.txt`

Site cu 3 pagini, deci impactul e mic acum, dar sunt fișiere de 5 minute care ajută Google să indexeze corect și oficial site-ul (mai ales dacă adăugăm pagini noi în viitor).

### 2.3 Fără Open Graph / Twitter Card meta tags

Dacă cineva trimite link-ul site-ului pe WhatsApp sau Facebook (canalul tău principal de distribuție, având în vedere pagina de FB), preview-ul va fi gol sau generic — fără poză, fără titlu formatat.

**Propunere:** adaug `og:title`, `og:description`, `og:image` (o poză reprezentativă), `og:url` pe toate 3 paginile. Impact vizibil imediat oricui distribuie link-ul.

### 2.4 Fără `<link rel="canonical">`

Minor, dar previne probleme de conținut duplicat dacă site-ul ajunge accesibil pe mai multe variante de URL (cu/fără `www`, cu/fără `index.html` etc.) — mai ales relevant când recuperezi `caloric.ro`.

---

## 3. GDPR / conformitate legală — relevant fiindcă suntem în UE

Momentan site-ul încarcă necondiționat: pluginul de Facebook (iframe, setează cookies de la Facebook), Google Maps (iframe, cookies de la Google), și Google Fonts (request direct către serverele Google) — toate înainte ca vizitatorul să confirme ceva. Legal, asta necesită fie consimțământ (cookie banner), fie evitarea încărcării lor până la o acțiune explicită a utilizatorului.

**Propunere, cu bonus de performanță:** în loc de un banner clasic de cookies (enervant, toată lumea îl urăște), transform Facebook și Google Maps în embed-uri "click-to-load" — utilizatorul vede un preview static/buton ("Vezi pagina de Facebook") și doar la click se încarcă efectiv iframe-ul cu cookie-urile lui. Rezolvă problema legală ȘI reduce greutatea paginii pentru toți cei care nu dau click (majoritatea).

---

## 4. Arhitectură / mentenabilitate cod

### 4.1 JS și markup-ul de navigare duplicate în 3 fișiere

Meniul mobil, animația de scroll-reveal, sistemul de modal — toate sunt scrise separat în `index.html` (235 linii JS), `daikin.html` (113 linii) și `value.html` (59 linii). Practic am văzut problema asta direct chiar în sesiunea asta: bug-ul de la modal (panoul alb pe alb în dark mode) a trebuit corectat în 2 fișiere separate, pentru că logica există în 2 locuri.

**Propunere:** exact pattern-ul pe care tocmai l-am aplicat la culori (`assets/tailwind-config.js`) — mut JS-ul comun (meniu mobil, reveal, modal) într-un singur `assets/site.js`, importat de toate paginile. O singură sursă de adevăr, un singur loc de reparat bug-uri.

### 4.2 Fișiere orfane la rădăcina proiectului

`logo.png`, `daikin-logo.png`, `value-logo.png`, `favicon.png` stau la rădăcina repo-ului, în afara `assets/` — par versiuni vechi/originale dinainte de reorganizare, nu sunt folosite direct de HTML (verificat). Curățenie, fără impact funcțional, dar merită șters ce nu se mai folosește.

---

## 5. Analytics — momentan zero date

Nu există niciun fel de analytics pe site (Google Analytics, Plausible, etc.). Practic nu ai vizibilitate pe: câți vizitatori vin, de unde (Facebook? Google? direct?), ce pagini/carduri de servicii se dau click, rata de conversie a formularului de ofertă.

**Propunere:** aș recomanda o soluție "privacy-first" (ex. Plausible sau Fathom) în locul Google Analytics — nu setează cookies, nu necesită banner GDPR, e mult mai simplu de citit (un singur dashboard, fără jargon de marketing), și costă puțin/lună. Dacă preferi ceva gratuit, GA4 e opțiunea, dar atunci intră sub incidența GDPR (cookie consent obligatoriu). Alegerea ține de cât de mult vrei să investești vs. cât de simplu vrei să rămână.

---

## 6. Detalii mici, câștig rapid

- **Pagina 404 lipsă** — GitHub Pages arată una generică, nebrandată, dacă cineva accesează un link greșit. 15 minute de lucru pentru una cu identitatea Caloric + link înapoi spre homepage.
- **hCaptcha — de verificat live** — am căutat scriptul hCaptcha (`js.hcaptcha.com`) în cod și nu apare explicit; probabil e injectat automat de scriptul Web3Forms, dar merită un test real (completezi formularul o dată, verifici că apare căsuța de captcha și că primești email-ul) ca să fim siguri că nu se blochează silențios.
- **`apple-touch-icon` / manifest** — pentru cine adaugă site-ul pe ecranul de acasă de pe telefon (relevant, dat fiind că discuția de dark mode a pornit tot de la un vizitator mobil), o iconiță proprie în loc de screenshot generic.

## 7. Accesibilitate — status neschimbat față de ce discutasem

Rămân deschise de la ultima discuție: focus-trap în modal (tab-ul poate "scăpa" din modal către conținutul din spate), un audit formal de contrast (acum mai ușor de făcut, fiindcă avem paleta dark mode fixată), stiluri `:focus-visible`. Nu le-am reluat acum, dar le menționez ca să rămână pe listă.

---

## Cum aș prioritiza, dacă mă întrebi

1. **Performanță imagini (1.2 + 1.3)** — impact mare, risc zero, nu schimbă nimic vizual.
2. **JSON-LD + Open Graph (2.1 + 2.3)** — cost mic, beneficiu real pe termen mediu la SEO și la share-uri pe WhatsApp/Facebook.
3. **Tailwind CLI (1.1)** — impact mare de performanță, dar cere puțin mai multă grijă la deploy (un pas în plus).
4. **GDPR click-to-load (3)** — corectitudine legală + bonus de performanță.
5. Restul (analytics, `site.js`, curățenie, 404) — utile, dar fără urgență.

Spune-mi pe care le vrei și în ce ordine, sau dacă vrei să le implementez pe toate dintr-odată.
