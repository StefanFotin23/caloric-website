# Refactorizare arhitectură — de decis înainte să încep

Aici e o decizie reală de arhitectură, nu doar "mut niște cod" — vreau să alegi tu direcția, fiindcă schimbă și fluxul de deploy, nu doar structura fișierelor. Citește cele 3 variante, spune-mi care sau dacă vrei alta.

---

## Ce rezolvăm, concret

Am identificat deja duplicarea exactă în analiza precedentă, o reiau pe scurt ca context:

- **Navigația** (header + meniu mobil) e scrisă de 3 ori, aproape identic, cu mici diferențe (pe `daikin.html`/`value.html` link-urile duc înapoi la `index.html#...`).
- **JS-ul** pentru meniu mobil, animația de scroll-reveal, și sistemul de modal e duplicat: 235 linii în `index.html`, 113 în `daikin.html`, 59 în `value.html`.
- **Footer-ul** și structura de `<head>` (meta tags, fonturi, Tailwind) sunt aproape identice în toate 3.
- Am simțit deja costul real azi: bug-ul de modal (alb pe alb în dark mode) a trebuit reparat manual în 2 fișiere separate, pentru că logica există în 2 locuri fizice.

Obiectiv: o singură sursă de adevăr pentru navigație/footer/modal/JS comun, ușor de întreținut, "scris modern" cum ai zis.

---

## Varianta A — Script de "stitching" minimal (fără framework nou)

Păstrăm exact ce avem (3 fișiere HTML statice, deploy = push pe GitHub Pages, fără npm), dar scoatem bucățile comune în fișiere `partials/nav.html`, `partials/footer.html`, `partials/modal.html`, și un script Python/Node scurt (rulat local, o comandă) care le "coase" în cele 3 pagini finale la build.

- **Ce se schimbă la deploy:** înainte de `git push`, mai rulezi o comandă (`python build.py`) care regenerează `index.html`/`daikin.html`/`value.html` din partials + conținutul specific fiecărei pagini.
- **Plus/Minus:** zero dependențe noi, ușor de înțeles cap-coadă, dar practic reinventăm o mică unealtă de site generator — nu e un pattern standard pe care îl recunoaște altcineva care se uită peste cod.

## Varianta B — Static site generator real (Eleventy) + Tailwind CLI + auto-deploy prin GitHub Actions

Trecem la [Eleventy](https://www.11ty.dev/) (framework de generat site-uri statice, foarte folosit, ușor, fără React/Vue/JS pe partea de client) — layout-uri și include-uri reale (`{% include "nav.html" %}`), template-uri pentru cardurile de servicii (în loc de 11 blocuri HTML aproape identice, un singur template + o listă de date). În aceeași mișcare, integrăm și Tailwind CLI (era oricum pe lista de propuneri de performanță — Eleventy + Tailwind CLI e un combo documentat oficial). Deploy: un GitHub Action care rulează build-ul automat la fiecare `git push` pe `main` și publică rezultatul — nu mai trimiți tu manual fișiere finale, doar sursa.

- **Ce se schimbă la deploy:** lucrezi pe fișiere sursă (`src/`), commit + push ca acum, dar build-ul (Eleventy + Tailwind) rulează automat în CI, nu local. Practic dispare pasul manual de "primesc fișierele finale, le pun pe desktop, le dau push."
- **Plus/Minus:** e arhitectura "corectă"/standard pentru genul ăsta de site — reutilizabilă, ușor de explicat oricui știe unelte web moderne, elimină și problema de Tailwind necompilat din propunerea de performanță (2 probleme rezolvate cu o singură schimbare). Costul: introduce Node.js + npm ca dependență reală de proiect (nu doar "zero-build cu 3 fișiere HTML"), și o curbă de învățare inițială — dar dat fiind fondul tău tehnic (K8s, sisteme distribuite), nu e ceva complicat pentru tine, e mai degrabă un "de învățat o dată, folosești oricând".

## Varianta C — Web Components native (zero build, tot client-side)

Definim `<site-nav>`, `<site-footer>`, `<product-modal>` ca [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) — JS nativ din browser, fără librărie externă, fără build step. Fiecare pagină HTML devine scurtă: `<site-nav active="daikin"></site-nav>` în loc de tot markup-ul repetat, iar componenta știe cum să se randeze.

- **Ce se schimbă la deploy:** nimic — rămâne exact fluxul actual (fișiere finale, push direct).
- **Plus/Minus:** zero unelte noi, e "modern" în sensul de API standard de browser (nu un hack), dar navigația se randează *după* ce rulează JS-ul — un mic risc de FOUC (o fracțiune de secundă fără meniu vizibil) și nu rezolvă nimic din partea de Tailwind/performanță din propunerea anterioară — rămân probleme separate.

---

## Recomandarea mea

**Varianta B** (Eleventy + Tailwind CLI + GitHub Actions). E singura care rezolvă atât duplicarea de cod, cât și problema de performanță cu Tailwind necompilat (deja pe lista de priorități), într-o mișcare coerentă — și e un pattern pe care orice inginer care se uită peste proiect îl recunoaște imediat, spre deosebire de un script custom (Varianta A) sau o soluție client-only (Varianta C) care nu ajută la performanță.

Costul real e că nu mai e "3 fișiere HTML, gata" — devine un proiect cu `npm install` + un pas de build, fie local, fie (recomandat) automat prin GitHub Actions la fiecare push. Dacă vrei să rămână cât mai simplu posibil, indiferent de cost, Varianta A e alternativa rezonabilă.

## Întrebări înainte să încep

1. **Care variantă?** (A, B, C, sau alta la care nu m-am gândit)
2. Dacă alegi **B**: vrei build automat prin GitHub Actions (recomandat — dispare pasul manual), sau preferi să rulezi build-ul tu local înainte de fiecare push?
3. Includem în aceeași mișcare și trecerea la Tailwind CLI (era oricum propusă separat), sau ținem strict de partea de duplicare cod și lăsăm Tailwind pe mai târziu?
