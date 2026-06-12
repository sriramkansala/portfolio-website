/* ============================================================
   Portfolio — main.js
   Scroll reveals · nav state · letter card scrub
   ============================================================ */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- current year ---- */
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- entrance animation: reveal hero content after short delay ---- */
  setTimeout(() => document.body.classList.add('is-loaded'), 400);

  /* ---- nav: flat on hero, pill appears after 80px scroll ---- */
  const nav = document.getElementById('nav');
  if (nav) {
    const updateNav = () => nav.classList.toggle('is-hero', window.scrollY < 80);
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
  }

  /* ---- scroll arrow fade-out once user has scrolled 60px ---- */
  const updateScrolled = () => document.body.classList.toggle('scrolled', window.scrollY > 60);
  updateScrolled();
  window.addEventListener('scroll', updateScrolled, { passive: true });

  /* ---- scroll reveals — two observers so headings always lead cards ---- */
  const headingSelectors = '.projects__head, .testimonials h2, .services__head, .reel h2, .cta__title, .section-label, .reel__sub';
  const headingObs = new IntersectionObserver(([e], obs) => {
    if (e.isIntersecting) { e.target.classList.add('in'); obs.disconnect(); }
  }, { threshold: 0.1, rootMargin: '0px 0px -15% 0px' });
  const cardObs = new IntersectionObserver(([e], obs) => {
    if (e.isIntersecting) { e.target.classList.add('in'); obs.disconnect(); }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    if (el.matches(headingSelectors)) {
      headingObs.observe(el);
    } else {
      cardObs.observe(el);
    }
  });

  /* ---- testimonial infinite scroll: duplicate cards ---- */
  const cards = document.querySelector('.testi__cards');
  if (cards && !reduced) {
    cards.innerHTML += cards.innerHTML;
  }

  /* ---- smooth anchor scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---- mobile menu ---- */
  window.closeMenu = () => {
    const m = document.getElementById('menu');
    if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
  };

  /* ---- stagger reveal on project / service cards ---- */
  document.querySelectorAll('.proj').forEach((el, i) => {
    // Alternate left/right by column (2-col grid: even=left, odd=right)
    const dir = (i % 2 === 0) ? 'reveal-left' : 'reveal-right';
    // Stagger by row: row 0 → d1/d2, row 1 → d3/d4
    const row = Math.floor(i / 2);
    const col = i % 2;
    const delay = `reveal-d${row * 2 + col + 1}`;
    el.classList.add(dir, delay);
  });
  document.querySelectorAll('.svc').forEach((el, i) => {
    el.classList.add('reveal', `reveal-d${i + 1}`);
  });
  /* .letter__card / .letter__portrait are driven by the scroll-scrubbed
     entry animation below (vogel.haus mechanic) — not the reveal system. */
  document.querySelectorAll('.tcard').forEach(el => {
    el.classList.add('reveal');
  });
  document.querySelectorAll('.projects__head, .testimonials h2, .services__head, .reel h2').forEach(el => {
    el.classList.add('reveal', 'reveal-slow');
  });
  document.querySelectorAll('.cta__title').forEach(el => {
    el.classList.add('reveal', 'reveal-slow');
  });
  /* ---- section labels and reel subtitle ---- */
  document.querySelectorAll('.section-label').forEach((el, i) => {
    el.classList.add('reveal', 'reveal-fast', 'reveal-d1');
  });
  document.querySelectorAll('.reel__sub').forEach(el => {
    el.classList.add('reveal', 'reveal-d2');
  });

  /* ---- trigger reveals already in viewport on load ---- */
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) el.classList.add('in');
    });
  }, 80);

  /* ============================================================
     LETTER CARD — scroll-scrubbed entry, cloned from vogel.haus
     (measured from the live site — see ../CARD-EXPAND-SPEC.md)

     Progress is element-entry based, like Motion's
     offset ["start end","end end"]:
       p = 0 when the card's untransformed top crosses the viewport
             bottom; p = 1 when its bottom reaches the viewport bottom.
     All channels interpolate LINEARLY against p, scrubbed directly
     (the smooth-wheel lerp below supplies the buttery feel, the same
     way native inertia does on the reference site):
       card:           y 50px→0   scale 0.70→1   rotate 7°→0
       left polaroid:  x 30→0  y 50→0  scale 0.9→1  rotate −3°→0
       right polaroid: x −30→0 y 50→0  scale 0.9→1  rotate  7°→0
     border-radius stays constant — the visual radius growing is just
     the scale multiplying it, exactly as on the reference.
     Desktop/tablet only: the reference ships its phone variant static.
     ============================================================ */
  const letterCard = document.querySelector('.letter__card');
  if (letterCard) {
    const polLeft  = document.querySelector('.letter__portrait--left');
    const polRight = document.querySelector('.letter__portrait:not(.letter__portrait--left)');
    const desktop  = window.matchMedia('(min-width: 810px)');
    const lerp = (a, b, p) => a + (b - a) * p;

    let trackTop = 0, trackH = 1;
    const measure = () => {
      // untransformed layout position — offsetTop ignores transforms
      let t = 0;
      for (let el = letterCard; el; el = el.offsetParent) t += el.offsetTop;
      trackTop = t;
      trackH = letterCard.offsetHeight;
    };

    const apply = () => {
      if (reduced || !desktop.matches) {
        letterCard.style.transform = '';
        if (polLeft)  polLeft.style.transform = '';
        if (polRight) polRight.style.transform = '';
        return;
      }
      const p = Math.min(1, Math.max(0, (window.scrollY + window.innerHeight - trackTop) / trackH));
      letterCard.style.transform =
        `translate3d(0, ${lerp(50, 0, p)}px, 0) scale(${lerp(0.7, 1, p)}) rotate(${lerp(7, 0, p)}deg)`;
      if (polLeft)  polLeft.style.transform =
        `translate3d(${lerp(30, 0, p)}px, ${lerp(50, 0, p)}px, 0) scale(${lerp(0.9, 1, p)}) rotate(${lerp(-3, 0, p)}deg)`;
      if (polRight) polRight.style.transform =
        `translate3d(${lerp(-30, 0, p)}px, ${lerp(50, 0, p)}px, 0) scale(${lerp(0.9, 1, p)}) rotate(${lerp(7, 0, p)}deg)`;
    };

    let letterRaf = false;
    const onLetterScroll = () => {
      if (!letterRaf) {
        letterRaf = true;
        requestAnimationFrame(() => { apply(); letterRaf = false; });
      }
    };
    measure();
    apply();
    window.addEventListener('scroll', onLetterScroll, { passive: true });
    window.addEventListener('resize', () => { measure(); apply(); }, { passive: true });
    // fonts/images settling can shift layout — re-measure once after load
    window.addEventListener('load', () => { measure(); apply(); });
  }



})();
