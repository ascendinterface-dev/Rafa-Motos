/* =============================================
   MECÂNICA RAFA MOTOS — script.js
   Interactions, Animations & Carousel Logic
   ============================================= */

(function () {
  'use strict';

  /* ---- Navbar Scroll Effect ---- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  /* ---- Hamburger Menu ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      const isOpen = navLinks.classList.contains('open');
      spans[0].style.transform = isOpen ? 'translateY(7px) rotate(45deg)' : '';
      spans[1].style.opacity = isOpen ? '0' : '';
      spans[2].style.transform = isOpen ? 'translateY(-7px) rotate(-45deg)' : '';
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const spans = hamburger.querySelectorAll('span');
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }

  /* ---- Scroll Reveal Animation ---- */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Stagger children in grids
  document.querySelectorAll('.servicos-grid, .catalogo-grid, .sobre-certs').forEach(grid => {
    grid.querySelectorAll('.reveal').forEach((child, i) => {
      child.dataset.delay = i * 120;
    });
  });

  // Stagger processo steps
  document.querySelectorAll('.processo-step').forEach((step, i) => {
    step.dataset.delay = i * 150;
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ---- Hero Parallax ---- */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `scale(1.04) translateY(${scrolled * 0.25}px)`;
      }
    }, { passive: true });
  }

  /* ---- Depoimentos Carousel ---- */
  const carousel = document.getElementById('depoimentos-carousel');
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('dep-prev');
  const nextBtn = document.getElementById('dep-next');

  if (carousel && dotsContainer && prevBtn && nextBtn) {
    const cards = carousel.querySelectorAll('.depoimento-card');
    let current = 0;
    let autoInterval;

    // Create dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Depoimento ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    function goTo(index) {
      current = (index + cards.length) % cards.length;
      carousel.scrollTo({ left: carousel.offsetWidth * current, behavior: 'smooth' });
      dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    function startAuto() {
      autoInterval = setInterval(() => goTo(current + 1), 5000);
    }
    function resetAuto() {
      clearInterval(autoInterval);
      startAuto();
    }

    startAuto();

    // Touch/Swipe
    let touchStartX = 0;
    carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 50) { goTo(delta > 0 ? current + 1 : current - 1); resetAuto(); }
    });
  }

  /* ---- Counter Animation for Hero Stats ---- */
  function animateCounter(el, end, duration = 1800) {
    const start = 0;
    const startTime = performance.now();
    const isPercent = el.dataset.suffix === '%';
    const prefix = el.dataset.prefix || '';

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(start + (end - start) * eased);
      el.textContent = prefix + value.toLocaleString('pt-BR') + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-number').forEach(el => {
          const text = el.textContent;
          const num = parseInt(text.replace(/\D/g, ''));
          const suffix = text.includes('%') ? '%' : '';
          const prefix = text.includes('+') ? '+' : '';
          el.dataset.suffix = suffix;
          el.dataset.prefix = prefix;
          animateCounter(el, num);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  /* ---- Marcas Infinite Scroll Pause on hover ---- */
  const marcasTrack = document.getElementById('marcas-track');
  if (marcasTrack) {
    marcasTrack.addEventListener('mouseenter', () => {
      marcasTrack.style.animationPlayState = 'paused';
    });
    marcasTrack.addEventListener('mouseleave', () => {
      marcasTrack.style.animationPlayState = 'running';
    });
  }

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Card hover glow effect ---- */
  document.querySelectorAll('.servico-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,107,0,0.06) 0%, var(--bg-card) 60%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });

  /* ---- Depoimento card hover glow ---- */
  document.querySelectorAll('.depoimento-card, .step-content, .cert-item').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = 'rgba(255, 107, 0, 0.35)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = '';
    });
  });

  /* ---- Active nav link on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinkEls.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4, rootMargin: '-80px 0px 0px 0px' });

  sections.forEach(s => sectionObserver.observe(s));

})();