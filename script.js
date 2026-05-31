/* ═══════════════════════════════════════════
   PERLA ACCESSORIES — script.js
   ═══════════════════════════════════════════ */

'use strict';

/* ─── Helpers ─── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/* ═══════════════════════════════════════════
   1. CUSTOM CURSOR
   ═══════════════════════════════════════════ */
(function initCursor() {
  const cursor   = qs('#cursor');
  const follower = qs('#cursorFollower');
  if (!cursor || !follower) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = 0, my = 0, fx = 0, fy = 0;
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animateFollower() {
    const dx = mx - fx;
    const dy = my - fy;
    fx += dx * 0.1;
    fy += dy * 0.1;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    rafId = requestAnimationFrame(animateFollower);
  }
  animateFollower();
})();

/* ═══════════════════════════════════════════
   2. NAV SCROLL BEHAVIOUR
   ═══════════════════════════════════════════ */
(function initNav() {
  const nav = qs('#nav');
  if (!nav) return;

  let lastY = 0;
  let ticking = false;

  function update() {
    const y = window.scrollY;
    if (y > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();

/* ═══════════════════════════════════════════
   3. FLOATING WHATSAPP
   ═══════════════════════════════════════════ */
(function initFloatWA() {
  const btn = qs('#floatWa');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) btn.classList.add('show');
    else btn.classList.remove('show');
  }, { passive: true });
})();

/* ═══════════════════════════════════════════
   4. HERO SPLIT-LINE REVEAL
   ═══════════════════════════════════════════ */
(function initHeroReveal() {
  const lines = qsa('.split-line');
  const eyebrow = qs('.hero-eyebrow');
  const fades = qsa('.hero .reveal-fade');

  // Stagger on load
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (eyebrow) eyebrow.style.opacity = '1';
      lines.forEach(line => {
        const delay = parseInt(line.dataset.delay || 0);
        setTimeout(() => line.classList.add('visible'), delay);
      });
      fades.forEach(el => {
        const delay = parseInt(el.dataset.delay || 0);
        setTimeout(() => el.classList.add('visible'), delay);
      });
    }, 200);
  });
})();

/* ═══════════════════════════════════════════
   5. SCROLL-BASED REVEAL (IntersectionObserver)
   ═══════════════════════════════════════════ */
(function initScrollReveal() {
  // reveal-word (inside headings)
  const wordObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const words = qsa('.reveal-word', entry.target);
      words.forEach((word, i) => {
        setTimeout(() => word.classList.add('visible'), i * 90);
      });
      // section-label
      const label = entry.target.querySelector('.reveal-label');
      if (label) label.classList.add('in-view');
      wordObs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  qsa('h2, h3, .collections-title, .gifts-title, .instagram-title, .contact-title, .story-headline').forEach(el => {
    wordObs.observe(el);
  });

  // section-labels standalone
  const labelObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        labelObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  qsa('.reveal-label').forEach(el => labelObs.observe(el));

  // reveal-fade
  const fadeObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  qsa('.reveal-fade').forEach(el => fadeObs.observe(el));

  // reveal-img
  const imgObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        imgObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  qsa('.reveal-img').forEach(el => imgObs.observe(el));
})();

/* ═══════════════════════════════════════════
   6. HORIZONTAL GALLERY SCROLL
   ═══════════════════════════════════════════ */
(function initHorizontalGallery() {
  const section = qs('#horizontal');
  const track   = qs('#hTrack');
  const progress = qs('#hProgress');
  if (!section || !track) return;

  // Make the section tall enough to allow scrolling
  function setup() {
    const trackW    = track.scrollWidth;
    const viewportW = track.parentElement.clientWidth;
    const scrollDist = trackW - viewportW;
    // Pin section height = viewport + scroll distance
    section.style.height = (window.innerHeight + Math.max(0, scrollDist)) + 'px';
    return { trackW, viewportW, scrollDist };
  }

  let dims = setup();
  window.addEventListener('resize', () => { dims = setup(); }, { passive: true });
  /* Expose globally so gallery can reinit after products load */
  window.recalcGallery = () => { dims = setup(); };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  function onScroll() {
    const rect = section.getBoundingClientRect();
    // How far we've scrolled into the section
    const entered = -rect.top;
    const { scrollDist } = dims;

    if (entered < 0 || entered > scrollDist + window.innerHeight) {
      ticking = false;
      return;
    }

    const ratio = clamp(entered / scrollDist, 0, 1);
    track.style.transform = `translateX(-${ratio * scrollDist}px)`;
    if (progress) progress.style.width = (ratio * 100) + '%';

    ticking = false;
  }
})();

/* ═══════════════════════════════════════════
   7. PARALLAX EFFECTS (Subtle)
   ═══════════════════════════════════════════ */
(function initParallax() {
  const hero = qs('.hero');
  const orbs = qsa('.orb');
  const decos = qsa('.hero-deco');

  if (!hero) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const heroH = hero.offsetHeight;
        if (y < heroH) {
          const ratio = y / heroH;
          // Parallax orbs
          orbs.forEach((orb, i) => {
            const speed = 0.2 + i * 0.07;
            orb.style.transform = `translate(0, ${y * speed}px) scale(${1 + ratio * 0.05})`;
          });
          // Parallax deco ring
          if (decos[0]) decos[0].style.transform = `translateY(${y * 0.15}px) rotate(${y * 0.04}deg)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ═══════════════════════════════════════════
   8. COLLECTION CARDS — Tilt Effect
   ═══════════════════════════════════════════ */
(function initCardTilt() {
  const cards = qsa('.collection-card, .h-card:not(:has(.hci-label-card))');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotX =  dy * -4;
      const rotY =  dx *  4;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(0.99)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ═══════════════════════════════════════════
   9. SMOOTH ANCHOR SCROLL
   ═══════════════════════════════════════════ */
(function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = qs(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ═══════════════════════════════════════════
   10. INSTAGRAM CELL — Mouse Track Glow
   ═══════════════════════════════════════════ */
(function initIgGlow() {
  const cells = qsa('.ig-cell');
  cells.forEach(cell => {
    const inner = cell.querySelector('.ig-inner');
    if (!inner) return;
    cell.addEventListener('mousemove', e => {
      const rect = cell.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      inner.style.setProperty('--mx', x + '%');
      inner.style.setProperty('--my', y + '%');
    });
  });
})();

/* ═══════════════════════════════════════════
   11. SECTION LABELS — Staggered watcher
   ═══════════════════════════════════════════ */
(function initSectionLabelObs() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  qsa('.section-label').forEach(el => obs.observe(el));
})();

/* ═══════════════════════════════════════════
   12. GIFT CARDS — Stagger on scroll
   ═══════════════════════════════════════════ */
(function initGiftStagger() {
  const grid = qs('.gifts-grid');
  if (!grid) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const cards = qsa('.gift-card', grid);
      cards.forEach((card, i) => {
        card.style.transitionDelay = (i * 0.12) + 's';
        card.classList.add('visible');
      });
      obs.unobserve(grid);
    });
  }, { threshold: 0.2 });
  obs.observe(grid);
})();

/* ═══════════════════════════════════════════
   13. MARQUEE — Pause on hover
   ═══════════════════════════════════════════ */
(function initMarquee() {
  const track = qs('.marquee-track');
  if (!track) return;
  const marquee = track.parentElement;
  marquee.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  marquee.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
})();

/* ═══════════════════════════════════════════
   14. PAGE LOAD — Body Fade In
   ═══════════════════════════════════════════ */
(function initPageLoad() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.8s ease';
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });
})();

/* ═══════════════════════════════════════════
   15. STAT NUMBERS — Count-up animation
   ═══════════════════════════════════════════ */
(function initCountUp() {
  const stats = qsa('.stat-num');
  if (!stats.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      // Extract numeric part
      const match = raw.match(/(\d+)/);
      if (!match) return;
      const end = parseInt(match[1]);
      const prefix = raw.slice(0, match.index);
      const suffix = raw.slice(match.index + match[0].length);
      let start = 0;
      const dur = 1400;
      const step = dur / 60;
      let current = 0;

      const tick = () => {
        current += step;
        const progress = clamp(current / dur, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = Math.round(eased * end);
        el.textContent = prefix + val + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.8 });

  stats.forEach(el => obs.observe(el));
})();

/* ═══════════════════════════════════════════
   16. STORY IMAGES — Parallax on scroll
   ═══════════════════════════════════════════ */
(function initStoryParallax() {
  const img1 = qs('.story-img-1');
  const img2 = qs('.story-img-2');
  if (!img1 || !img2) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const section = qs('.story');
      if (!section) { ticking = false; return; }
      const rect = section.getBoundingClientRect();
      const mid = rect.top + rect.height / 2 - window.innerHeight / 2;
      const ratio = clamp(-mid / (window.innerHeight * 0.6), -1, 1);
      img1.style.transform = `translateY(${ratio * -18}px)`;
      img2.style.transform = `translateY(${ratio *  22}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();
