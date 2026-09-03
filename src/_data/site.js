// Global site constants — the "un fisier de constante" pattern extended
// beyond just colors: phone/email/address/hours/social/keys used across
// all 3 pages now live here once, instead of being retyped in each
// contact section and each <meta> block.
//
// Available in any template as {{ site.xxx }}.
module.exports = {
  // Computed at build time — used for sitemap.xml's <lastmod> (optimization
  // audit item 1.3). Not per-page granular (Eleventy's own `page.date`
  // would be per-source-file, but sitemap.njk lists these 3 URLs by hand,
  // not from a collection) — good enough to tell crawlers "this was built
  // recently", refreshes automatically on every `npm run build`.
  buildDate: new Date().toISOString().slice(0, 10),
  // Cache-busting token (2026-09-03) — appended as ?v=... to the site.css/
  // site.js <link>/<script> tags in base.njk. buildDate above only changes
  // once per DAY, so two deploys on the same day (like today) would share
  // one value and NOT bust a CDN/browser cache between them — which is
  // exactly what happened: Stefan couldn't see the new Program indicator
  // because Cloudflare (now in Proxied mode) kept serving a stale cached
  // assets/site.js from an earlier deploy today. Date.now() is unique
  // per `npm run build` run, so every deploy forces a fresh fetch.
  buildTimestamp: Date.now(),
  // Canonical URL of the deployed site — the ONE place this is defined.
  // Used by canonical <link>, Open Graph/Twitter og:url, and sitemap.xml/
  // robots.txt. Update this single value (no trailing slash) once caloric.ro
  // DNS is recovered and the custom domain is wired up in GitHub Pages —
  // everything downstream picks it up automatically.
  baseUrl: "https://caloric.ro",
  // Social-preview image (WhatsApp/Facebook link cards) — 1200x630, cropped
  // from the Perfera lifestyle photo (src/assets/daikin-perfera-w.jpg).
  ogImage: "assets/og-image.jpg",
  companyName: "Caloric",
  // Identificare juridică (Legea 365/2002, art. 5) — cerute de Stefan direct de pe
  // listafirme.ro 2026-09-01, afișate în footer lângă Contact (decizia lui, nu
  // ascunse pe o pagină separată).
  legalName: "Caloric Serv SRL",
  cui: "7045530",
  regCom: "J09/116/1995",
  euid: "ROONRC.J9/116/1995",
  phone: "+40 744 502 692",
  phoneHref: "tel:+40744502692",
  whatsappHref: "https://wa.me/40744502692",
  email: "caloricfrig@yahoo.com",
  address: "Bd. Dorobantilor 466, Brăila",
  addressFull: "Bd. Dorobanților 466, 810091 Brăila",
  hours: {
    weekdays: "Luni - Vineri: 08:00 - 17:00",
    weekend: "Sâmbătă - Duminică: Închis",
    // Structured schedule (2026-09-03) — single source of truth for the
    // live Deschis/Închis indicator in nav.njk + contact.njk (task:
    // Stefan wants a "Program" shortcut in nav that shows green/red status).
    // Client JS reads these via data-* attributes on <body> instead of
    // hardcoding the schedule a second time — change only these three
    // fields if the program ever changes, and the indicator updates itself.
    openDays: [1, 2, 3, 4, 5], // ISO weekday: 1=Luni ... 7=Duminică
    openStart: "08:00",
    openEnd: "17:00",
  },
  // Județele acoperite (zonă apropiată + zonă extinsă, vezi coverage-map.njk)
  // — folosite atât în JSON-LD (areaServed) cât și, din 2026-08-31, ca text
  // vizibil lângă harta de acoperire (optimization audit item 4.2).
  areaServed: [
    "Brăila", "Galați", "Vrancea", "Buzău", "Vaslui", "Ialomița", "Tulcea",
    "Ilfov", "București", "Călărași", "Constanța", "Iași", "Brașov",
    "Argeș", "Bacău", "Dâmbovița", "Prahova", "Covasna", "Neamț", "Giurgiu",
  ],
  facebookUrl: "https://www.facebook.com/people/Caloric/100083597462753/",
  facebookPagePluginSrc:
    "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D100083597462753&tabs=timeline&width=360&height=480&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false",
  mapEmbedSrc:
    "https://www.google.com/maps?q=Bd.%20Dorobantilor%20466%2C%20Br%C4%83ila%2C%20Romania&output=embed",
  web3formsAccessKey: "b88e84eb-a1e4-42fc-b390-1f04e5352c5d",
  googleRating: {
    value: "4.8",
    count: 11,
  },
};
