(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Loader ---- */
  const loader = document.getElementById('loader');
  if (loader) {
    const dismiss = () => loader.classList.add('is-done');
    window.addEventListener('load', () => {
      setTimeout(dismiss, prefersReduced ? 100 : 1300);
    });
    // Safety fallback
    setTimeout(dismiss, 3500);
  }

  /* ---- Nav scroll state ---- */
  const nav = document.getElementById('nav');
  if (nav) {
    const setNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 60);
    setNav();
    window.addEventListener('scroll', setNav, { passive: true });
  }

  /* ---- Hero scroll indicator ---- */
  const heroScroll = document.getElementById('heroScroll');
  if (heroScroll) {
    const checkScroll = () => {
      if (window.scrollY > 80) heroScroll.classList.add('is-hidden');
      else heroScroll.classList.remove('is-hidden');
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
  }

  /* ---- Mobile menu ---- */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileMenuClose');

  if (burger && mobileMenu) {
    const openMenu = () => {
      mobileMenu.classList.add('is-open');
      mobileMenu.removeAttribute('inert');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('inert', '');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', openMenu);
    mobileClose && mobileClose.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---- Scroll reveals ---- */
  if (!prefersReduced) {
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Stagger siblings
            const siblings = entry.target.parentElement
              ? Array.from(entry.target.parentElement.querySelectorAll('.reveal'))
              : [];
            const idx = siblings.indexOf(entry.target);
            const delay = idx > 0 ? idx * 100 : 0;
            setTimeout(() => {
              entry.target.classList.add('is-in');
            }, delay);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -24px 0px' });
      revealEls.forEach(el => io.observe(el));
    }
  } else {
    // Reduced motion: reveal everything immediately
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
  }

  /* ---- Gallery lightbox ---- */
  const galleryGrid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  if (galleryGrid && lightbox && lightboxImg) {
    const items = Array.from(galleryGrid.querySelectorAll('.gallery__item'));
    let currentIdx = 0;

    const openLightbox = (idx) => {
      currentIdx = idx;
      const img = items[currentIdx].querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    };

    const closeLightbox = () => {
      lightbox.setAttribute('hidden', '');
      document.body.style.overflow = '';
    };

    const showPrev = () => {
      currentIdx = (currentIdx - 1 + items.length) % items.length;
      const img = items[currentIdx].querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    };

    const showNext = () => {
      currentIdx = (currentIdx + 1) % items.length;
      const img = items[currentIdx].querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    };

    items.forEach((item, idx) => {
      item.addEventListener('click', () => openLightbox(idx));
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', `View photo ${idx + 1} of ${items.length}`);
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(idx); }
      });
    });

    lightboxClose && lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev && lightboxPrev.addEventListener('click', showPrev);
    lightboxNext && lightboxNext.addEventListener('click', showNext);

    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', e => {
      if (lightbox.hasAttribute('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });
  }

  /* ---- Current day hours highlight ---- */
  const dayMap = {
    1: ['hours-lunch', 'hours-dinner', 'hours-happyhour'], // Tue
    2: ['hours-lunch', 'hours-dinner', 'hours-happyhour'], // Wed
    3: ['hours-lunch', 'hours-dinner', 'hours-happyhour'], // Thu
    4: ['hours-lunch', 'hours-dinner', 'hours-happyhour'], // Fri
    6: ['hours-dinner'],                                    // Sat
  };

  const today = new Date().getDay(); // 0=Sun, 1=Mon ... 6=Sat
  // Note: JS getDay() 0=Sun; Q's week: 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun(closed), 1=Mon(closed)
  // Remap: Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
  const todayRows = {
    2: ['hours-lunch', 'hours-dinner', 'hours-happyhour'],
    3: ['hours-lunch', 'hours-dinner', 'hours-happyhour'],
    4: ['hours-lunch', 'hours-dinner', 'hours-happyhour'],
    5: ['hours-lunch', 'hours-dinner', 'hours-happyhour'],
    6: ['hours-dinner'],
  };

  const rowIds = todayRows[today];
  if (rowIds) {
    rowIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('is-today');
    });
  }

  /* ---- Smooth anchor scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = window.innerWidth <= 768
        ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h-mobile'))
        : parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h-desktop'));
      const top = target.getBoundingClientRect().top + window.scrollY - (navH || 72);
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

})();
