/* =====================================================================
   NIXO CONTENT GRID - interactions
   Vanilla JS only. No dependencies.
   ===================================================================== */
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- PRELOADER ---------------- */
  (function preloader() {
    const el = $('#preloader');
    if (!el) return;
    const bar = $('.preloader__bar span', el);
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(p + Math.random() * 18, 100);
      bar.style.width = p + '%';
      if (p >= 100) clearInterval(tick);
    }, 130);

    const finish = () => {
      bar.style.width = '100%';
      setTimeout(() => {
        el.classList.add('is-done');
        document.body.classList.remove('is-locked');
        setTimeout(() => el.remove(), 700);
      }, 320);
    };
    document.body.classList.add('is-locked');
    window.addEventListener('load', finish);
    setTimeout(finish, 3500); // safety net
  })();

  /* ---------------- CUSTOM CURSOR ---------------- */
  (function cursor() {
    const ring = $('#cursor'), dot = $('#cursorDot');
    if (!ring || !dot || window.matchMedia('(hover:none)').matches) return;

    let x = 0, y = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate(${x - 3}px,${y - 3}px)`;
      ring.classList.add('is-on'); dot.classList.add('is-on');
    });
    document.addEventListener('mouseleave', () => {
      ring.classList.remove('is-on'); dot.classList.remove('is-on');
    });

    (function loop() {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.transform = `translate(${rx - 17}px,${ry - 17}px)`;
      requestAnimationFrame(loop);
    })();

    const hot = 'a,button,.tilt,.icard,.scard,.tcard,input,[data-cursor]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hot)) ring.classList.add('is-link');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hot)) ring.classList.remove('is-link');
    });
  })();

  /* ---------------- SCROLL PROGRESS + STICKY HEADER ---------------- */
  (function scrollUI() {
    const bar = $('#scrollBar'), header = $('#header'), toTop = $('#toTop');
    const onScroll = () => {
      const st = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
      if (header) header.classList.toggle('is-stuck', st > 12);
      if (toTop) toTop.style.opacity = st > 500 ? '1' : '.45';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------------- TOPBAR DISMISS ---------------- */
  (function topbar() {
    const btn = $('#topbarClose'), bar = $('#topbar');
    if (btn && bar) btn.addEventListener('click', () => bar.classList.add('is-hidden'));
  })();

  /* ---------------- MOBILE NAV ---------------- */
  (function nav() {
    const burger = $('#burger'), menu = $('#nav');
    if (!burger || !menu) return;

    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    const toggle = (open) => {
      burger.classList.toggle('is-open', open);
      menu.classList.toggle('is-open', open);
      overlay.classList.toggle('is-on', open);
      document.body.classList.toggle('is-locked', open);
    };

    burger.addEventListener('click', () => toggle(!menu.classList.contains('is-open')));
    overlay.addEventListener('click', () => toggle(false));
    $$('.nav__link, .nav__cta a', menu).forEach(a => a.addEventListener('click', () => toggle(false)));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });
  })();

  /* ---------------- SCROLLSPY ---------------- */
  (function spy() {
    const links = $$('.nav__link');
    const targets = links
      .map(l => ({ link: l, sec: $(l.getAttribute('href')) }))
      .filter(t => t.sec);
    if (!targets.length) return;

    const setActive = (link) => {
      links.forEach(l => l.classList.toggle('is-active', l === link));
    };

    const io = new IntersectionObserver((entries) => {
      if (window.scrollY < 120) return; // near the top, "Home" wins
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const hit = targets.find(t => t.sec === en.target);
        if (hit) setActive(hit.link);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    targets.forEach(t => io.observe(t.sec));

    // pin "Home" whenever we're back at the top
    window.addEventListener('scroll', () => {
      if (window.scrollY < 120) setActive(targets[0].link);
    }, { passive: true });
  })();

  /* ---------------- REVEAL ON SCROLL ---------------- */
  (function reveal() {
    const items = $$('.reveal, .about__ring, .sign');
    if (!items.length) return;
    if (reduced) { items.forEach(i => i.classList.add('is-in')); return; }

    const show = (el, delay) => {
      if (el.classList.contains('is-in')) return;
      if (delay) setTimeout(() => el.classList.add('is-in'), delay);
      else el.classList.add('is-in');
      io.unobserve(el);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        show(en.target, parseInt(en.target.dataset.delay || '0', 10));
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    items.forEach(i => io.observe(i));

    /* Safety sweep: an instant jump (deep link like /#pricing, or restored
       scroll position) can carry an element from below the fold to above it
       without it ever intersecting; it would stay invisible forever if the
       user scrolled back up. Reveal anything at or above the viewport. */
    const sweep = () => {
      items.forEach(el => {
        if (el.classList.contains('is-in')) return;
        if (el.getBoundingClientRect().top < window.innerHeight) show(el, 0);
      });
    };
    window.addEventListener('load', sweep);
    window.addEventListener('hashchange', () => setTimeout(sweep, 700));
    setTimeout(sweep, 400);
  })();

  /* ---------------- COUNTERS ---------------- */
  (function counters() {
    const nums = $$('.count');
    if (!nums.length) return;

    const run = (el) => {
      const to = parseFloat(el.dataset.to || '0');
      const suffix = el.dataset.suffix || '';
      const dur = 1800;
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * eased).toLocaleString('en-US') + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        run(en.target);
        obs.unobserve(en.target);
      });
    }, { threshold: 0.5 });

    nums.forEach(n => io.observe(n));
  })();

  /* ---------------- HERO WORD ROTATOR ---------------- */
  (function rotator() {
    const box = $('#rotator');
    if (!box || reduced) return;
    const words = [
      'content that connects',
      'strategies that scale',
      'reels that convert',
      'brands that dominate',
      'stories that stick'
    ];
    const item = box.querySelector('.rotator__item');
    if (!item) return;
    let i = 0;

    setInterval(() => {
      item.classList.remove('is-in');
      item.classList.add('is-out');
      setTimeout(() => {
        i = (i + 1) % words.length;
        item.textContent = words[i];
        item.classList.remove('is-out');
        item.classList.add('is-in');
      }, 450);
    }, 2600);
  })();

  /* ---------------- TABS ---------------- */
  (function tabs() {
    const nav = $('.tabs__nav');
    if (!nav) return;
    const btns = $$('.tabs__btn', nav);
    const pill = $('#tabsPill');

    const movePill = () => {
      const active = $('.tabs__btn.is-active', nav);
      if (!active || !pill) return;
      pill.style.width  = active.offsetWidth + 'px';
      pill.style.height = active.offsetHeight + 'px';
      pill.style.transform = `translate(${active.offsetLeft}px,${active.offsetTop}px)`;
    };

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('is-active'));
        $$('.tabs__panel').forEach(p => p.classList.remove('is-active'));
        btn.classList.add('is-active');
        const panel = document.getElementById(btn.dataset.tab);
        if (panel) panel.classList.add('is-active');
        movePill();
      });
    });

    window.addEventListener('resize', movePill);
    window.addEventListener('load', movePill);
    setTimeout(movePill, 260);
  })();

  /* ---------------- ACCORDION ---------------- */
  (function accordion() {
    const root = $('#accordion');
    if (!root) return;
    const items = $$('.acc', root);

    const setH = (item, open) => {
      const body = $('.acc__body', item);
      const inner = $('.acc__inner', item);
      body.style.height = open ? inner.offsetHeight + 'px' : '0px';
    };

    items.forEach(item => {
      setH(item, item.classList.contains('is-open'));
      $('.acc__head', item).addEventListener('click', () => {
        const open = item.classList.contains('is-open');
        items.forEach(i => { i.classList.remove('is-open'); setH(i, false); });
        if (!open) { item.classList.add('is-open'); setH(item, true); }
      });
    });

    window.addEventListener('resize', () => {
      items.forEach(i => setH(i, i.classList.contains('is-open')));
    });
  })();

  /* ---------------- TESTIMONIAL CAROUSEL ---------------- */
  (function carousel() {
    const root = $('#carousel');
    if (!root) return;
    const track = $('#cTrack'), viewport = $('#cViewport');
    const prev = $('#cPrev'), next = $('#cNext'), dotsBox = $('#cDots');
    const slides = $$('.tcard', track);
    if (!slides.length) return;

    const GAP = 24;
    let index = 0, perView = 3, maxIndex = 0, timer = null;

    const calcPerView = () => {
      const w = window.innerWidth;
      return w <= 720 ? 1 : w <= 1100 ? 2 : 3;
    };

    const buildDots = () => {
      dotsBox.innerHTML = '';
      for (let i = 0; i <= maxIndex; i++) {
        const b = document.createElement('button');
        b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        b.addEventListener('click', () => { go(i); restart(); });
        dotsBox.appendChild(b);
      }
    };

    const paint = () => {
      const step = slides[0].offsetWidth + GAP;
      track.style.transform = `translateX(${-index * step}px)`;
      $$('button', dotsBox).forEach((d, i) => d.classList.toggle('is-active', i === index));
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index === maxIndex;
    };

    const go = (i) => { index = Math.max(0, Math.min(i, maxIndex)); paint(); };

    const layout = () => {
      perView = calcPerView();
      maxIndex = Math.max(0, slides.length - perView);
      index = Math.min(index, maxIndex);
      buildDots();
      paint();
    };

    const restart = () => {
      clearInterval(timer);
      if (reduced) return;
      timer = setInterval(() => go(index >= maxIndex ? 0 : index + 1), 5200);
    };

    prev && prev.addEventListener('click', () => { go(index - 1); restart(); });
    next && next.addEventListener('click', () => { go(index + 1); restart(); });

    // drag / swipe
    let down = false, startX = 0, delta = 0;
    const start = (x) => { down = true; startX = x; delta = 0; track.classList.add('is-drag'); clearInterval(timer); };
    const move  = (x) => {
      if (!down) return;
      delta = x - startX;
      const step = slides[0].offsetWidth + GAP;
      track.style.transform = `translateX(${-index * step + delta}px)`;
    };
    const end = () => {
      if (!down) return;
      down = false;
      track.classList.remove('is-drag');
      if (Math.abs(delta) > 60) go(delta < 0 ? index + 1 : index - 1); else paint();
      restart();
    };

    viewport.addEventListener('mousedown', e => { e.preventDefault(); start(e.clientX); });
    window.addEventListener('mousemove', e => move(e.clientX));
    window.addEventListener('mouseup', end);
    viewport.addEventListener('touchstart', e => start(e.touches[0].clientX), { passive: true });
    viewport.addEventListener('touchmove',  e => move(e.touches[0].clientX),  { passive: true });
    viewport.addEventListener('touchend', end);

    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', restart);
    window.addEventListener('resize', layout);

    layout();
    restart();
  })();

  /* ---------------- INDUSTRY FILTERS ---------------- */
  (function filters() {
    const btns = $$('.filters__btn');
    const cards = $$('#indGrid .icard');
    if (!btns.length || !cards.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        /* There is no "All" button: the grid starts unfiltered, and clicking
           the active filter again clears it, which is the only way back to the
           full set. */
        const wasActive = btn.classList.contains('is-active');
        btns.forEach(b => b.classList.remove('is-active'));
        if (!wasActive) btn.classList.add('is-active');
        const f = wasActive ? 'all' : btn.dataset.filter;

        cards.forEach((card, i) => {
          const show = f === 'all' || card.dataset.cat === f;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            card.style.animation = 'none';
            void card.offsetWidth;
            card.style.animation = `fadeUp .5s var(--ease-out) ${i * 60}ms both`;
          }
        });
      });
    });
  })();

  /* ---------------- PRICING BILLING SWITCH ---------------- */
  (function billing() {
    const sw = $('#billSwitch');
    if (!sw) return;
    const labels = $$('.switch__lbl');

    sw.addEventListener('click', () => {
      const yearly = sw.classList.toggle('is-on');
      labels.forEach(l => l.classList.toggle('is-active', l.dataset.bill === (yearly ? 'yr' : 'mo')));

      $$('.pcard__price b').forEach(b => {
        const val = yearly ? b.dataset.yr : b.dataset.mo;
        b.style.transform = 'translateY(-10px)';
        b.style.opacity = '0';
        setTimeout(() => {
          b.textContent = val;
          b.style.transition = 'transform .35s var(--ease), opacity .35s';
          b.style.transform = 'none';
          b.style.opacity = '1';
        }, 180);
      });

      $$('.pcard__price span').forEach(s => {
        s.textContent = yearly ? 'PKR /year' : 'PKR /month';
      });
    });
  })();

  /* ---------------- MAGNETIC BUTTONS ---------------- */
  (function magnetic() {
    if (reduced || window.matchMedia('(hover:none)').matches) return;
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${mx * 0.22}px,${my * 0.34}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  })();

  /* ---------------- BUTTON RIPPLE ---------------- */
  (function ripple() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - r.left - size / 2) + 'px';
      span.style.top  = (e.clientY - r.top  - size / 2) + 'px';
      btn.appendChild(span);
      setTimeout(() => span.remove(), 680);
    });
  })();

  /* ---------------- 3D TILT ---------------- */
  (function tilt() {
    if (reduced || window.matchMedia('(hover:none)').matches) return;
    $$('.tilt').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width  - 0.5;
        const py = (e.clientY - r.top)  / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
      });
    });
  })();

  /* ---------------- PARALLAX ORNAMENTS ---------------- */
  (function parallax() {
    const items = $$('.parallax');
    if (!items.length || reduced) return;
    let ticking = false;

    const update = () => {
      const vh = window.innerHeight;
      items.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const speed = parseFloat(el.dataset.speed || '15');
        const progress = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translateY(${progress * speed * -1.6}px)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  })();

  /* ---------------- SMOOTH ANCHORS ---------------- */
  (function anchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 78;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  })();

  /* ---------------- RIGHT-CLICK DETERRENT ----------------
     Suppresses the context menu so assets can't be grabbed via
     "Save image as". This is a deterrent, NOT protection: the markup,
     styles, script and images are all delivered to the client and stay
     reachable through DevTools, Ctrl+U, view-source: or curl. Anything a
     browser can render, a visitor can save. */
  (function noContextMenu() {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-lock"/></svg>' +
                      '<span>Content is protected.</span>';
    document.body.appendChild(toast);

    let timer;
    document.addEventListener('contextmenu', (e) => {
      // Form fields keep their native menu: visitors need paste and
      // spellcheck to complete the signup field.
      if (e.target.closest('input, textarea, select, [contenteditable]')) return;

      e.preventDefault();
      toast.classList.add('is-on');
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove('is-on'), 1600);
    });
  })();

  /* ---------------- HERO CHIP TICKER ---------------- */
  (function chip() {
    const el = $('#chipEngage');
    if (!el || reduced) return;
    const vals = ['+312%', '+248%', '+415%', '+189%'];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % vals.length;
      el.style.opacity = '0';
      setTimeout(() => { el.textContent = vals[i]; el.style.opacity = '1'; }, 220);
    }, 3400);
    el.style.transition = 'opacity .22s';
  })();

})();
