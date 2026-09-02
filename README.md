# Site HVAC — landing page

Site de prezentare pentru o firmă de instalații HVAC — construit cu [Eleventy](https://www.11ty.dev/) (static site generator) + [Tailwind CSS](https://tailwindcss.com/) (compilat prin Tailwind CLI, nu CDN), deploy automat pe GitHub Pages prin GitHub Actions.

## De ce arată așa proiectul acum

Înainte, `index.html`/`daikin.html`/`value.html` erau 3 fișiere separate, fiecare cu navigația, footer-ul, modalul de produs și JS-ul scrise de mână, de 3 ori. Acum:

- `src/_includes/` — layout-ul de bază + partials (nav, footer, modal) scrise **o singură dată**, folosite de toate paginile.
- `src/_data/` — conținutul (cardurile de servicii, logo-urile din marquee, contactul) e date structurate (JSON/JS), nu HTML hardcodat. Editezi un card = editezi un obiect JSON, nu cauți markup-ul prin 3 fișiere.
- `src/assets/site.js` — tot JS-ul comun (meniu mobil, modal, formular) e într-un singur fișier, nu triplat.
- `tailwind.config.js` — paleta de culori `ice`/`ember` e definită o singură dată, compilată static la build (nu mai rulează în browser-ul vizitatorului, ca înainte cu Tailwind Play CDN).

Rezultatul final (`index.html`, `daikin.html`, `value.html` generate) e — intenționat — identic vizual și funcțional cu ce era înainte. Asta e strict o refactorizare de arhitectură, fără schimbări de conținut/design.

## Cum lucrezi pe proiect

```bash
npm install        # o singură dată, sau ori de câte ori se schimbă package.json
npm run dev         # server local cu live-reload, la http://localhost:8080
npm run build        # build final, scrie totul în _site/ (ce se publică)
```

- Editezi textul unui card de serviciu → `src/_data/services.json`
- Adaugi/ștergi un logo din marquee → `src/_data/partners.json`
- Editezi contactul (telefon, adresă, program) → `src/_data/site.js`
- Editezi navigația/footer-ul → `src/_includes/partials/nav.njk` / `footer.njk`
- Editezi culorile → `tailwind.config.js`
- Adaugi conținut nou pe o pagină → `src/index.njk` / `src/daikin.njk` / `src/value.njk`

## Deploy

Nu mai trimiți fișiere finale manual. La fiecare `git push` pe `main`, [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) rulează automat `npm ci && npm run build` pe serverele GitHub și publică rezultatul.

**Setup unic, o singură dată** — în repo, Settings → Pages → sub "Build and deployment", schimbă "Source" din "Deploy from a branch" în **"GitHub Actions"**. Fără acest pas, GitHub Pages nu va folosi workflow-ul nou.

## Notă despre verificare

Acest proiect a fost scris fără să pot rula `npm install`/`npm run build` local (`registry.npmjs.org` e blocat în mediul din care am scris codul) — prima verificare reală se întâmplă fie la tine local, fie în primul run din GitHub Actions după push. Dacă ceva pică la build, log-ul din tab-ul Actions al repo-ului arată exact unde — trimite-mi eroarea și o reparăm.
