// Shared front-end behavior for all 3 Caloric pages — previously this exact
// logic was hand-copied into index.html (235 lines), daikin.html (113) and
// value.html (59), which is why the dark-mode modal bug needed 2 separate
// fixes earlier in this project. One file now, loaded by all 3 pages.
//
// Every piece below checks that its target element(s) actually exist before
// doing anything, so this file is safe to load unconditionally even on a
// page that doesn't have a particular feature (e.g. the Google-rating badge
// only exists on index.html; the code below just no-ops on the other pages).

(function () {
  'use strict';

  // ---- Footer year -------------------------------------------------------
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Sticky nav shadow on scroll ---------------------------------------
  var navbar = document.getElementById('navbar');
  if (navbar) {
    var onScroll = function () {
      navbar.classList.toggle('shadow-nav', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Mobile hamburger menu ----------------------------------------------
  var menuBtn = document.getElementById('menu-btn');
  var menuIcon = document.getElementById('menu-icon');
  var mobileMenu = document.getElementById('mobile-menu');

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    if (menuIcon) { menuIcon.classList.remove('fa-xmark'); menuIcon.classList.add('fa-bars'); }
  }

  function toggleMobileMenu() {
    if (!mobileMenu) return;
    var isOpen = mobileMenu.classList.toggle('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', String(isOpen));
    if (menuIcon) {
      menuIcon.classList.toggle('fa-bars', !isOpen);
      menuIcon.classList.toggle('fa-xmark', isOpen);
    }
  }

  if (menuBtn) menuBtn.addEventListener('click', toggleMobileMenu);
  document.querySelectorAll('.mobile-link').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  // ---- Smooth scroll for same-page "#anchor" links -------------------------
  // Accounts for the fixed navbar (+ index.html's secondary sub-nav, when
  // present) height, so an anchor target doesn't end up hidden underneath
  // them. Only ever matches same-page "#foo" hrefs — the cross-page
  // "index.html#foo" links used on daikin.html/value.html don't start with
  // "#" so this selector simply skips them; native `scroll-behavior: smooth`
  // (see input.css) handles the page-load jump to the anchor on those pages.
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId.length <= 1) return;
      var target = document.querySelector(targetId);
      if (!target || !navbar) return;
      e.preventDefault();
      var subnav = document.getElementById('subnav');
      var subnavHeight = (subnav && subnav.offsetParent !== null) ? subnav.offsetHeight : 0;
      var navHeight = navbar.offsetHeight + subnavHeight;
      var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 12;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  // ---- Live Google rating (optional) --------------------------------------
  // If a Place ID + API key are set on the badge (index.html only), fetch
  // the current rating/review count from the Google Places API (New) and
  // replace the static text. Missing config or a failed request just leaves
  // the static fallback already in the HTML untouched — nothing breaks.
  // Cached in localStorage for 24h so a returning visitor (or a scripted
  // request flood) triggers at most one real API call per day.
  (function () {
    var badge = document.getElementById('google-rating-badge');
    if (!badge) return;
    var apiKey = badge.dataset.apiKey;
    var placeId = badge.dataset.placeId;
    if (!apiKey || !placeId) return;

    var CACHE_KEY = 'caloric_google_rating_v1';
    var CACHE_TTL_MS = 24 * 60 * 60 * 1000;

    function render(rating, count) {
      badge.innerHTML = '<i class="fa-solid fa-star text-ember-400"></i> '
        + rating.toFixed(1) + '/5 pe Google (' + count + ' recenzii)';
    }

    try {
      var cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
        render(cached.rating, cached.count);
        return;
      }
    } catch (e) { /* localStorage unavailable — just fetch fresh below */ }

    fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(placeId)
      + '?fields=rating,userRatingCount&key=' + encodeURIComponent(apiKey))
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res.status); })
      .then(function (data) {
        if (typeof data.rating === 'number' && typeof data.userRatingCount === 'number') {
          render(data.rating, data.userRatingCount);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ rating: data.rating, count: data.userRatingCount, ts: Date.now() }));
          } catch (e) { /* ignore — non-critical */ }
        }
      })
      .catch(function () { /* keep the static fallback already rendered */ });
  })();

  // ---- Product detail modal + full-size image zoom ------------------------
  // Any element with class="product-card" and a data-modal-title attribute
  // (see the productCard() macro) opens this on click.
  var productModal = document.getElementById('product-modal');
  if (productModal) {
    var productModalBackdrop = document.getElementById('product-modal-backdrop');
    var productModalClose = document.getElementById('product-modal-close');
    var productModalGallery = document.getElementById('product-modal-gallery');
    var productModalTitle = document.getElementById('product-modal-title');
    var productModalText = document.getElementById('product-modal-text');
    var zoomOverlay = document.getElementById('image-zoom-overlay');
    var zoomImg = document.getElementById('image-zoom-img');

    var openProductModal = function (card) {
      var images = JSON.parse(card.dataset.modalImages || '[]');
      productModalTitle.textContent = card.dataset.modalTitle || '';
      productModalText.textContent = card.dataset.modalText || '';
      productModalGallery.innerHTML = images.map(function (img) {
        return '<div class="relative rounded-xl overflow-hidden border border-ice-100 dark:bg-ice-900 dark:border-ice-800 cursor-zoom-in modal-zoom-trigger" data-full="' + img.src + '" data-alt="' + img.alt + '">'
          + '<img src="' + img.src + '" alt="' + img.alt + '" class="w-full aspect-[4/3] object-cover">'
          + (img.tag ? '<span class="absolute top-2 left-2 bg-ember-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">' + img.tag + '</span>' : '')
          + '</div>';
      }).join('');
      productModal.classList.remove('hidden'); productModal.classList.add('flex');
      productModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('overflow-hidden');
    };

    var closeProductModal = function () {
      productModal.classList.add('hidden'); productModal.classList.remove('flex');
      productModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('overflow-hidden');
    };

    document.querySelectorAll('.product-card[data-modal-title]').forEach(function (card) {
      card.addEventListener('click', function () { openProductModal(card); });
    });
    if (productModalClose) productModalClose.addEventListener('click', closeProductModal);
    if (productModalBackdrop) productModalBackdrop.addEventListener('click', closeProductModal);

    var openZoom = function (src, alt) {
      zoomImg.src = src; zoomImg.alt = alt || '';
      zoomOverlay.classList.remove('hidden'); zoomOverlay.classList.add('flex');
      zoomOverlay.setAttribute('aria-hidden', 'false');
    };
    var closeZoom = function () {
      zoomOverlay.classList.add('hidden'); zoomOverlay.classList.remove('flex');
      zoomOverlay.setAttribute('aria-hidden', 'true');
    };

    if (productModalGallery) {
      productModalGallery.addEventListener('click', function (e) {
        var trigger = e.target.closest('.modal-zoom-trigger');
        if (trigger) openZoom(trigger.dataset.full, trigger.dataset.alt);
      });
    }
    if (zoomOverlay) zoomOverlay.addEventListener('click', closeZoom);

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (zoomOverlay && !zoomOverlay.classList.contains('hidden')) closeZoom();
      else if (!productModal.classList.contains('hidden')) closeProductModal();
    });
  }

  // ---- Scroll-reveal animation ---------------------------------------------
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  // ---- Click-to-load third-party embeds (GDPR pass, 2026-08-30) ------------
  // Google Maps + the Facebook Page Plugin used to load unconditionally on
  // every page view, sending cookies/requests to Google/Facebook before any
  // visitor action — a real GDPR/ePrivacy exposure. Now nothing loads until
  // the visitor clicks the button; that click IS the consent, so this needs
  // no cookie banner. Bonus: the iframe no longer loads on every visit,
  // which is also a real performance win (see the audit doc).
  document.querySelectorAll('.embed-gate').forEach(function (gate) {
    var btn = gate.querySelector('.embed-gate-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src = gate.dataset.embedSrc;
      iframe.title = gate.dataset.embedTitle || '';
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.style.border = '0';
      iframe.loading = 'lazy';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share');
      gate.innerHTML = '';
      gate.appendChild(iframe);
    });
  });

  // ---- Lead form: submit via fetch to Web3Forms ----------------------------
  // Shows an inline success/error message without leaving the page.
  var quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    var formResult = document.getElementById('form-result');
    var submitBtn = quoteForm.querySelector('button[type="submit"]');
    var submitLabel = document.getElementById('submit-label');

    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // If hCaptcha is enabled on this form in the Web3Forms dashboard,
      // block submission client-side until it's solved (Web3Forms also
      // verifies this server-side — this just avoids a wasted round-trip).
      var captchaField = quoteForm.querySelector('[name="h-captcha-response"]');
      if (captchaField && !captchaField.value) {
        formResult.classList.remove('hidden');
        formResult.textContent = 'Te rugăm să confirmi căsuța de securitate (captcha) înainte de a trimite.';
        formResult.className = 'text-sm font-medium text-center text-red-600';
        return;
      }

      submitBtn.disabled = true;
      submitLabel.textContent = 'Se trimite...';
      formResult.classList.add('hidden');

      var payload = Object.fromEntries(new FormData(quoteForm).entries());

      fetch(quoteForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          formResult.classList.remove('hidden');
          if (data.success) {
            formResult.textContent = 'Mulțumim! Cererea ta a fost trimisă. Te contactăm în curând.';
            formResult.className = 'text-sm font-medium text-center text-green-600';
            quoteForm.reset();
          } else {
            formResult.textContent = 'A apărut o eroare. Te rugăm să încerci din nou sau să ne scrii pe WhatsApp.';
            formResult.className = 'text-sm font-medium text-center text-red-600';
          }
        })
        .catch(function () {
          formResult.classList.remove('hidden');
          formResult.textContent = 'A apărut o eroare de conexiune. Te rugăm să încerci din nou sau să ne scrii pe WhatsApp.';
          formResult.className = 'text-sm font-medium text-center text-red-600';
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitLabel.textContent = 'Trimite Cererea';
        });
    });
  }
})();
