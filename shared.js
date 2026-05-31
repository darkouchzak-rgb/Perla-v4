/* ═══════════════════════════════════════════════════════
   PERLA V2 — shared.js
   Nav: Femme/Homme hover dropdowns + cart + WhatsApp
   ═══════════════════════════════════════════════════════ */

'use strict';

const PERLA = {
  wa: window.__PERLA_WA__ || '212660055928',
  ig: window.__PERLA_IG__ || 'perla_para_ella',
};

/* ══════════════════════════════════════════════════════
   CART ENGINE
   ══════════════════════════════════════════════════════ */
const Cart = {
  KEY: 'perla_cart_v2',

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },

  save(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    this.updateBadge();
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  },

  add(product, qty = 1) {
    const items = this.get();
    const idx   = items.findIndex(i => i.slug === product.slug);
    if (idx > -1) items[idx].qty = Math.min(items[idx].qty + qty, 10);
    else          items.push({ ...product, qty });
    this.save(items);
  },

  remove(slug) {
    this.save(this.get().filter(i => i.slug !== slug));
  },

  updateQty(slug, qty) {
    const items = this.get();
    const idx   = items.findIndex(i => i.slug === slug);
    if (idx > -1) {
      if (qty <= 0) items.splice(idx, 1);
      else          items[idx].qty = Math.min(qty, 10);
    }
    this.save(items);
  },

  clear() {
    localStorage.removeItem(this.KEY);
    this.updateBadge();
  },

  count() {
    return this.get().reduce((s, i) => s + i.qty, 0);
  },

  total() {
    return this.get().reduce((s, i) => {
      return s + (parseFloat(i.price.replace(/[^0-9.]/g, '')) || 0) * i.qty;
    }, 0);
  },

  totalFormatted() {
    return this.total().toFixed(0) + ' MAD';
  },

  updateBadge() {
    const n = this.count();
    document.querySelectorAll('.cart-badge').forEach(b => {
      b.textContent = n > 9 ? '9+' : n;
      b.classList.toggle('visible', n > 0);
    });
  },
};

/* ══════════════════════════════════════════════════════
   NAV BUILDER HELPERS
   ══════════════════════════════════════════════════════ */

/* Arrow SVG for dropdowns */
const arrowSvg = `<svg class="nav-dropdown-arrow" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l5 5 5-5"/></svg>`;

/* Cart SVG */
const cartSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>`;

/* WhatsApp SVG */
const waSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

/* Build a dropdown block */
function buildDropdown(label, items) {
  const linksHtml = items.map(item => {
    const cls = item.isVoirTout ? ' class="dropdown-voir-tout"' : '';
    return `<a href="${item.href}"${cls}>${item.label}</a>`;
  }).join('');

  return `
    <div class="nav-dropdown">
      <button class="nav-dropdown-trigger">
        ${label} ${arrowSvg}
      </button>
      <div class="nav-dropdown-panel">
        ${linksHtml}
      </div>
    </div>`;
}

/* ══════════════════════════════════════════════════════
   NAV INJECTION
   ══════════════════════════════════════════════════════ */
function injectNav(currentPage) {

  /* Remove any existing nav */
  const existing = document.getElementById('nav');
  if (existing) existing.remove();

  const isHome = currentPage === 'index.html' || currentPage === '';

  /* ── Femme dropdown items ── */
  const femmeItems = [
    { href: '/products.html?genre=Femme',                              label: 'Voir tout',           isVoirTout: true },
    { href: '/products.html?genre=Femme&category=Bagues',              label: 'Bagues' },
    { href: '/products.html?genre=Femme&category=Colliers',            label: 'Colliers' },
    { href: '/products.html?genre=Femme&category=Bracelets',           label: 'Bracelets' },
    { href: "/products.html?genre=Femme&category=Boucles d'oreilles",  label: "Boucles d'oreilles" },
    { href: '/products.html?genre=Femme&category=Manchettes',          label: 'Manchettes' },
    { href: '/products.html?genre=Femme&category=Cha%C3%AEne%20de%20pieds', label: 'Khelkhal' },
    { href: '/products.html?genre=Femme&category=Ensemble',            label: 'Ensemble' },
    { href: '/products.html?genre=Femme&category=Broches',             label: 'Broches' },
    { href: '/products.html?genre=Femme&category=Piercings',           label: 'Piercings' },
  ];

  /* ── Homme dropdown items ── */
  const hommeItems = [
    { href: '/products.html?genre=Homme',                     label: 'Voir tout', isVoirTout: true },
    { href: '/products.html?genre=Homme&category=Bracelets',  label: 'Bracelets' },
    { href: '/products.html?genre=Homme&category=Colliers',   label: 'Colliers' },
    { href: '/products.html?genre=Homme&category=Bagues',     label: 'Bagues' },
  ];

  /* ── Desktop center links ──
     Homepage: dropdowns + Histoire + Collections + Galerie + Contact
     Inner pages: dropdowns + Accueil + Panier
  ── */
  const extraLinksHome = `
    <a href="#story">Histoire</a>
    <a href="#collections">Collections</a>
    <a href="#gallery">Galerie</a>
    <a href="#contact">Contact</a>`;

  const extraLinksInner = `
    <a href="/index.html">Accueil</a>
    <a href="/cart.html">Panier</a>`;

  const desktopCenterHtml = `
    ${buildDropdown('Femme', femmeItems)}
    ${buildDropdown('Homme', hommeItems)}
    ${isHome ? extraLinksHome : extraLinksInner}`;

  /* ── Mobile drawer — grouped accordion ── */
  const mobileFemmeSubs = femmeItems.filter(i => !i.isVoirTout).map(i =>
    `<a href="${i.href}" class="mob-sub-link">${i.label}</a>`
  ).join('');
  const mobileHommeSubs = hommeItems.filter(i => !i.isVoirTout).map(i =>
    `<a href="${i.href}" class="mob-sub-link">${i.label}</a>`
  ).join('');
  const mobileExtraHome  = `<a href="#story" class="mob-link">Histoire</a><a href="#collections" class="mob-link">Collections</a><a href="#gallery" class="mob-link">Galerie</a><a href="#contact" class="mob-link">Contact</a>`;
  const mobileExtraInner = `<a href="/index.html" class="mob-link">Accueil</a><a href="/cart.html" class="mob-link">Panier</a>`;

  const mobileHtml = `
    <div class="mob-group">
      <button class="mob-group-trigger" onclick="this.parentElement.classList.toggle('open')">
        Femme <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="mob-group-links">
        <a href="/products.html?genre=Femme" class="mob-sub-link mob-voir-tout">Voir tout</a>
        ${mobileFemmeSubs}
      </div>
    </div>
    <div class="mob-group">
      <button class="mob-group-trigger" onclick="this.parentElement.classList.toggle('open')">
        Homme <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="mob-group-links">
        <a href="/products.html?genre=Homme" class="mob-sub-link mob-voir-tout">Voir tout</a>
        ${mobileHommeSubs}
      </div>
    </div>
    ${isHome ? mobileExtraHome : mobileExtraInner}
  `;

  /* ── Build nav ── */
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.id = 'nav';
  nav.innerHTML = `
    <div class="nav-logo">
      <a href="/index.html">
        <img src="/images/logo.png" alt="Perla" class="nav-logo-img"
          onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block';" />
        <span class="nav-logo-text-fallback">PERLA</span>
      </a>
    </div>

    <div class="nav-center">
      <div class="nav-links">${desktopCenterHtml}</div>
    </div>

    <div class="nav-right">
      <a href="/cart.html" class="nav-cart-btn" aria-label="Panier">
        ${cartSvg}
        <span class="cart-badge"></span>
      </a>
      <a href="https://wa.me/${PERLA.wa}" target="_blank" class="nav-whatsapp">
        ${waSvg} WhatsApp
      </a>
      <button class="nav-burger" id="navBurger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <div class="nav-mobile-menu" id="navMobile">${mobileHtml}</div>`;

  document.body.prepend(nav);

  /* ── Scroll ── */
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Burger ── */
  const burger = document.getElementById('navBurger');
  const mobile = document.getElementById('navMobile');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobile.classList.toggle('open');
  });
  mobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobile.classList.remove('open');
    });
  });

  /* ── Logo filter ── */
  const logoImg = nav.querySelector('.nav-logo-img');
  if (logoImg) {
    const applyFilter = () => {
      logoImg.style.filter = (!nav.classList.contains('scrolled') && isHome)
        ? 'brightness(0) invert(1)'
        : 'none';
    };
    window.addEventListener('scroll', applyFilter, { passive: true });
    applyFilter();
  }

  /* ── Touch: tap dropdown trigger on mobile to toggle ── */
  document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const panel = trigger.nextElementSibling;
      const isOpen = panel.style.opacity === '1';
      /* Close all first */
      document.querySelectorAll('.nav-dropdown-panel').forEach(p => {
        p.style.opacity = '0';
        p.style.pointerEvents = 'none';
        p.style.transform = 'translateX(-50%) translateY(-8px)';
      });
      if (!isOpen) {
        panel.style.opacity = '1';
        panel.style.pointerEvents = 'all';
        panel.style.transform = 'translateX(-50%) translateY(0)';
      }
    });
  });

  /* Close dropdowns on outside click */
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown-panel').forEach(p => {
        p.style.opacity = '0';
        p.style.pointerEvents = 'none';
        p.style.transform = 'translateX(-50%) translateY(-8px)';
      });
    }
  });
}

/* ══════════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════════ */
function injectFooter() {
  const existing = document.querySelector('footer.footer');
  if (existing) existing.remove();

  const igSvg = `<svg viewBox="0 0 24 24" fill="currentColor" width="18"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`;
  const waFootSvg = `<svg viewBox="0 0 24 24" fill="currentColor" width="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="footer-top">
      <div class="footer-brand">
        <div class="footer-logo">PERLA</div>
        <p class="footer-tagline">Porté avec intention.</p>
        <div class="footer-socials">
          <a href="https://instagram.com/${PERLA.ig}" target="_blank" aria-label="Instagram">${igSvg}</a>
          <a href="https://wa.me/${PERLA.wa}" target="_blank" aria-label="WhatsApp">${waFootSvg}</a>
        </div>
      </div>
      <div class="footer-nav-col">
        <h5>Femme</h5>
        <a href="/products.html?genre=Femme">Voir tout</a>
        <a href="/products.html?genre=Femme&category=Bagues">Bagues</a>
        <a href="/products.html?genre=Femme&category=Colliers">Colliers</a>
        <a href="/products.html?genre=Femme&category=Bracelets">Bracelets</a>
        <a href="/products.html?genre=Femme&category=Khelkhal">Khelkhal</a>
        <a href="/products.html?genre=Femme&category=Ensemble">Ensemble</a>
        <a href="/products.html?genre=Femme&category=Broches">Broches</a>
        <a href="/products.html?genre=Femme&category=Piercings">Piercings</a>
        <a href="/products.html?genre=Femme&category=Boucles d'oreilles">Boucles</a>
      </div>
      <div class="footer-nav-col">
        <h5>Homme</h5>
        <a href="/products.html?genre=Homme">Voir tout</a>
        <a href="/products.html?genre=Homme&category=Bracelets">Bracelets</a>
        <a href="/products.html?genre=Homme&category=Colliers">Colliers</a>
        <a href="/products.html?genre=Homme&category=Bagues">Bagues</a>
      </div>
      <div class="footer-nav-col">
        <h5>Contact</h5>
        <a href="https://wa.me/${PERLA.wa}" target="_blank">WhatsApp</a>
        <a href="https://instagram.com/${PERLA.ig}" target="_blank">Instagram</a>
        <span class="footer-hours">Lun–Sam · 9h–19h</span>
        <span class="footer-hours">Maroc</span>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2025 Perla Accessories. Tous droits réservés.</span>
      <span class="footer-divider">·</span>
      <span>Créé avec soin au Maroc</span>
    </div>`;
  document.body.appendChild(footer);
}

/* ══════════════════════════════════════════════════════
   FLOATING WHATSAPP
   ══════════════════════════════════════════════════════ */
function injectFloatWA() {
  const existing = document.getElementById('floatWa');
  if (existing) existing.remove();
  const btn = document.createElement('a');
  btn.href = `https://wa.me/${PERLA.wa}?text=Bonjour Perla!`;
  btn.target = '_blank';
  btn.className = 'float-wa';
  btn.id = 'floatWa';
  btn.setAttribute('aria-label', 'WhatsApp');
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="white" width="26"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span class="float-wa-pulse"></span>`;
  document.body.appendChild(btn);
  window.addEventListener('scroll', () =>
    btn.classList.toggle('show', window.scrollY > 300), { passive: true });
}

/* ══════════════════════════════════════════════════════
   CURSOR
   ══════════════════════════════════════════════════════ */
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (document.getElementById('cursor')) return;
  const c  = Object.assign(document.createElement('div'), { className: 'cursor',          id: 'cursor' });
  const cf = Object.assign(document.createElement('div'), { className: 'cursor-follower', id: 'cursorFollower' });
  document.body.prepend(cf, c);
  let mx = 0, my = 0, fx = 0, fy = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    c.style.left = mx + 'px'; c.style.top = my + 'px';
  });
  (function tick() {
    fx += (mx - fx) * 0.1; fy += (my - fy) * 0.1;
    cf.style.left = fx + 'px'; cf.style.top = fy + 'px';
    requestAnimationFrame(tick);
  })();
}

/* ══════════════════════════════════════════════════════
   SCROLL REVEALS
   ══════════════════════════════════════════════════════ */
function initReveal() {
  const wordObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.reveal-word').forEach((w, i) =>
        setTimeout(() => w.classList.add('visible'), i * 90));
      e.target.querySelectorAll('.reveal-label').forEach(l => l.classList.add('in-view'));
      wordObs.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('h1, h2, h3, section').forEach(el => wordObs.observe(el));
  const makeObs = t => new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: t });
  document.querySelectorAll('.reveal-fade').forEach(el => makeObs(0.12).observe(el));
  document.querySelectorAll('.reveal-img').forEach(el  => makeObs(0.08).observe(el));
  document.querySelectorAll('.section-label, .reveal-label').forEach(el => makeObs(0.4).observe(el));
}

function initPageFade() {
  document.body.style.opacity    = '0';
  document.body.style.transition = 'opacity 0.55s ease';
  window.addEventListener('load', () =>
    requestAnimationFrame(() => { document.body.style.opacity = '1'; }));
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
    });
  });
}

/* ══════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page
    || location.pathname.split('/').pop()
    || 'index.html';
  injectNav(page);
  injectFooter();
  injectFloatWA();
  initCursor();
  initReveal();
  initPageFade();
  initSmoothScroll();
  Cart.updateBadge();
});

window.PerlaCart = Cart;
window.PERLA     = PERLA;
