# Analiza site + propuneri de optimizare — 2026-08-31

Astea sunt doar **propuneri**, nimic nu e încă implementat. Am recitit tot codul curent din `src/` (nu doar ce era în audit-ul din 2026-08-29 — multe din itemii de-atunci sunt deja gata) ca să văd ce mai poate fi îmbunătățit acum, după toate rundele deja făcute (GDPR, SEO de bază, imagini, arhitectură, itemi mici, harta de acoperire, popup-ul de produse). Găsit lucruri noi pe partea tehnică, SEO, design/UX și marketing/text. Le discutăm, îmi spui pe care le vrei și în ce ordine, și le implementez — ca de obicei, un item o dată.

Două lucruri deja pe listă din audit-ul vechi, încă deschise, nu le repet aici în detaliu: **analytics** (zero momentan) și **accesibilitate completă** (focus-trap în popup, contrast, `:focus-visible`). Rămân disponibile oricând vrei să le abordăm.

---

## 1. Tehnic — descoperiri noi, nu erau în audit-ul din 2026-08-29

### ~~1.1 hCaptcha~~ — CORECTAT, nu era o problemă reală (verificat 2026-08-31)

Am zis inițial că hCaptcha nu funcționează pentru că nu vedeam un `<script src="https://js.hcaptcha.com/1/api.js">` separat în pagină. Stefan a semnalat că din ce vede el, captcha-ul funcționează — am verificat în documentația oficială Web3Forms și am greșit: scriptul lor propriu (`https://web3forms.com/client/script.js`, deja încărcat în `base.njk`) detectează singur `div.h-captcha` și încarcă tot ce trebuie, fără script separat — e integrare "zero-config" by design. Deci acest item cade, nu mai e legat de misterul livrării Web3Forms.

### ~~1.2 Cele 3 poze de hero sunt trase direct de pe Unsplash~~ — FĂCUT 2026-08-31

`hero-bg`, `daikin-hero`, `value-hero` din `src/css/input.css` folosesc `background-image: url("https://images.unsplash.com/...")` — adică cea mai vizibilă imagine de pe fiecare pagină (fundalul de la primul ecran) nu e găzduită de noi, ci vine live de pe Unsplash, la fiecare vizită. Trei probleme:

- **Performanță**: fiind `background-image` în CSS și nu un `<img>`, browserul nu o poate prioritiza ca element LCP (Largest Contentful Paint) — nu se poate face preload, nu are `fetchpriority`, și mai e nevoie de o conexiune nouă către un domeniu extern înainte să înceapă să se descarce.
- **Dependență externă**: dacă Unsplash pică, e lent, sau schimbă structura URL-urilor, fundalul dispare sau se încarcă foarte greu — pe cea mai importantă imagine a fiecărei pagini.
- **Poze generice, nu ale voastre** — exact genul de lucru pe care l-ai corectat deja peste tot în altă parte (pozele produselor, poza de portofoliu) — dar cele 3 hero-uri au rămas stock.

**Făcut:** am descărcat cele 3 poze (recadrate 1920×1080, nu mai risipim pixeli pe zone care oricum erau tăiate de `background-size: cover`), recomprimate JPEG progresiv (~253-370KB fiecare, față de fișierele Unsplash originale netăiate), salvate în `src/assets/` (`hero-braila-service.jpg`, `hero-daikin.jpg`, `hero-value.jpg`), și `src/css/input.css` actualizat să le folosească local în loc de `images.unsplash.com`. Verificat vizual pe toate 3 paginile — arată identic, doar autohostuit acum. Tot poze stock rămân (nu ale voastre) — dacă apar poze reale potrivite pentru hero (instalații, sediu, echipă), le putem înlocui oricând, fișierele sunt deja la locul potrivit.

### 1.3 `sitemap.xml` nu are `<lastmod>` (prioritate mică)

Fiecare `<url>` din `sitemap.njk` are doar `<loc>`, fără dată de ultimă modificare. Nu e o problemă mare, dar un `<lastmod>` ajută motoarele de căutare să știe când să re-crawleze — simplu de adăugat (data de build sau o dată fixă per pagină).

### 1.4 WebP/AVIF pentru imagini (prioritate mică, deja discutat și amânat conștient)

Am optimizat deja JPEG-urile la dimensiunea reală de afișare (pasul din 2026-08-30, ~49% mai mic). WebP/AVIF ar mai tăia încă ~15-30% față de JPEG optimizat, la aceeași calitate — dar cere `<picture>` cu fallback pentru fiecare imagine, deci mai multă muncă pentru un câștig mai mic decât primul pas. Las-o ca opțiune pe termen lung, nu prioritate acum.

### 1.5 Odată ce recuperezi DNS-ul pentru caloric.ro (item deja deschis)

Nu e ceva de făcut acum, dar merită știut: când conectezi domeniul propriu, poți pune Cloudflare (gratuit) în față — GitHub Pages nu-ți permite să setezi headere custom (cache-control, HSTS, CSP), dar Cloudflare da. Nu urgent, doar o notă pentru când ajungem acolo.

---

## 2. SEO — dincolo de ce am făcut deja (canonical, OG, sitemap, robots.txt)

### 2.1 JSON-LD e minimal — poate fi mult mai bogat (prioritate medie)

Momentan avem un singur bloc `HVACBusiness` cu nume/adresă/telefon/program. Lipsesc câteva lucruri care ajută la căutări locale și la rich results în Google:

- **`areaServed`** — acum că harta de acoperire definește exact județele (zonă apropiată + extinsă), e trivial să adăugăm aceeași listă și în schema structurată. Ajută Google să vă asocieze cu căutări din Galați, Vrancea, Tulcea etc., nu doar Brăila.
- **`geo`** (latitudine/longitudine) — mic plus pentru local pack.
- **`priceRange`** — opțional, dar unele rich results îl folosesc.
- **`hasOfferCatalog`/`Service`** — listă structurată a serviciilor reale (climatizare, pompe de căldură, ventilație, refrigerare comercială) în loc să fie doar text pe pagină — poate debloca rich snippets pe termen lung.
- **`BreadcrumbList`** — pe `daikin.html`/`value.html`, ajută la structura de crawling (Acasă → Daikin / Acasă → Value).

### 2.2 Legătura către `daikin.html`/`value.html` e cam ascunsă (prioritate medie)

Meniul principal (`nav.njk`) are un link "Parteneri" care duce mereu la `index.html#parteneri` — chiar și când ești deja pe `daikin.html`. Paginile dedicate Daikin/Value au titlu și descriere proprii, bune pentru SEO, dar singura cale către ele e cardul din secțiunea Parteneri de pe homepage (trebuie să dai scroll să ajungi acolo). Din nav sau footer nu poți sări direct pe `daikin.html`/`value.html`.

**Propunere:** fie facem "Parteneri" un mic dropdown din nav (Daikin / Value), fie adăugăm linkuri directe în footer (vezi 3.1 mai jos). Ajută atât vizitatorii cât și crawler-ul să găsească paginile astea mai ușor.

---

## 3. Design / UX

### 3.1 Footer-ul e foarte minimal (prioritate medie)

Acum e doar `© {an} Caloric. Toate drepturile rezervate.` + `Brăila, România`. Lipsesc lucruri standard care ajută la încredere și la SEO intern:

- Telefon/email/adresă repetate (NAP — Name/Address/Phone — consistent pe toată pagina ajută și la SEO local)
- Linkuri rapide către secțiuni (Servicii, Parteneri, Portofoliu, Contact) și către `daikin.html`/`value.html` (vezi 2.2)
- Iconiță Facebook (aveți pagina, dar nu e linkuită nicăieri în afara embed-ului din Portofoliu)

### 3.2 Nicio secțiune de testimoniale/recenzii (prioritate medie)

Aveți 4.8★ din 11 recenzii pe Google, dar nimic din conținutul recenziilor nu apare pe site — doar rating-ul numeric în hero. Am scos intenționat `aggregateRating` din schema JSON-LD tocmai pentru că Google descurajează asta când recenziile nu sunt afișate real pe pagină. Dacă adăugăm 2-3 recenzii reale (cu numele clientului, cu acordul lui) undeva pe homepage, câștigăm dublu: încredere vizuală pentru vizitatori, și redeschidem opțiunea de a pune `aggregateRating` înapoi în schema, corect de data asta.

### 3.3 Buton WhatsApp doar în secțiunea Contact (prioritate mică-medie)

Momentan linkul WhatsApp există doar în cardul din Contact, jos de tot pe pagină. Un buton plutitor (fixed, colț dreapta-jos), vizibil tot timpul cât se derulează pagina, e un pattern comun și cu conversie bună pentru site-uri de servicii locale din România. E o schimbare de design vizibilă — vreau părerea ta înainte să o fac, nu toată lumea vrea un buton fix pe ecran.

---

## 4. Marketing & conținut

### 4.1 O mică secțiune de întrebări frecvente (FAQ) (prioritate medie)

Nu există nimic de genul "Cât costă montajul unui AC?", "Cât durează instalarea?", "Ce garanție oferiți?", "Faceți și service/mentenanță ulterior?" — genul de întrebări pe care le pune orice client înainte să sune. Un FAQ scurt (4-6 întrebări) pe homepage:

- Răspunde obiecțiilor înainte de a suna, ceea ce de obicei crește rata de conversie a formularului
- Se poate marca cu schema `FAQPage`, ceea ce uneori aduce rich snippet-uri direct în rezultatele Google (mai mult spațiu vizual pentru voi în căutare, gratuit)

Aș avea nevoie de tine pentru răspunsurile reale (prețuri orientative, termene, politica de garanție) — eu pot scrie formularea, dar conținutul factual trebuie confirmat de tine.

### 4.2 Zonele acoperite nu sunt menționate explicit în text, doar vizual pe hartă (prioritate mică-medie)

Harta de acoperire arată județele, dar numele lor concrete apar doar în `alt`-ul imaginii (bun pentru accesibilitate/SEO tehnic, dar invizibil pentru un vizitator obișnuit și cu greutate mai mică pentru Google decât text vizibil). O propoziție sau un rând scurt de genul "Intervenim rapid în Brăila, Galați, Vrancea, Buzău... și la cerere în Iași, Brașov, Constanța..." undeva vizibil lângă hartă ar ajuta la căutări de tipul "aer condiționat Galați" sau "pompă de căldură Tulcea" — genul de căutări locale pe care harta singură nu le acoperă din punct de vedere text.

### 4.3 Certificări/autorizații — de discutat (prioritate: depinde ce aveți)

Nu apare nicio mențiune despre autorizații specifice domeniului (ex. atestat pentru manipulare agenți frigorifici / F-Gas, autorizații RSVTI dacă e cazul, alte certificări relevante pentru instalatori HVAC în România) — dincolo de parteneriatul Daikin, care e vizibil. Dacă aveți așa ceva, afișarea lor (cu insigna reală) e un semnal de încredere puternic mai ales pentru clienți comerciali/instituționali. Spune-mi ce aveți efectiv și vedem cum le punem în pagină.

---

Ca de obicei: alegi ce vrei, în ce ordine, discutăm fiecare pe rând înainte să implementez.
