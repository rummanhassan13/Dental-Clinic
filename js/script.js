/* ==========================================================
   Dr. Nabeel Dental Care — Scripts
   ========================================================== */
(function () {
  'use strict';

  // ---------- Helpers ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ---------- Footer year ----------
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Sticky header shadow ----------
  const header = $('#header');
  const onScroll = () => {
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile nav ----------
  const nav = $('#nav');
  const navToggle = $('#navToggle');
  const navClose = $('#navClose');
  const navOverlay = $('#navOverlay');

  const openNav = () => {
    nav.classList.add('active');
    navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  const closeNav = () => {
    nav.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  navToggle && navToggle.addEventListener('click', openNav);
  navClose && navClose.addEventListener('click', closeNav);
  navOverlay && navOverlay.addEventListener('click', closeNav);

  // Close nav when clicking a link (mobile)
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 769) closeNav();
    });
  });

  // ---------- Smooth scroll w/ offset ----------
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 10;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---------- Scroll spy (active nav) ----------
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  const spy = () => {
    const scrollPos = window.scrollY + (header ? header.offsetHeight + 50 : 100);
    let current = '';
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  // ---------- Reveal on scroll ----------
  const revealTargets = $$('.section-head, .service-card, .why-card, .testi-card, .about-img, .about-text, .hero-text, .hero-image, .gallery-grid figure, .contact-info, .contact-map');
  revealTargets.forEach(el => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in'));
  }

  // ---------- Booking modal ----------
  const modal = $('#bookingModal');
  const form = $('#bookingForm');
  const successBox = $('#formSuccess');
  const submitBtn = $('#submitBtn');
  let lastFocus = null;

  const openModal = () => {
    lastFocus = document.activeElement;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    // Focus the first input for accessibility
    setTimeout(() => {
      const firstInput = modal.querySelector('input, select, textarea');
      firstInput && firstInput.focus();
    }, 200);
  };
  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocus) lastFocus.focus();
  };

  $$('[data-open-booking]').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    if (window.innerWidth < 769) closeNav();
    openModal();
  }));
  $$('[data-close-booking]').forEach(btn => btn.addEventListener('click', closeModal));

  // Close modal with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

  // ---------- Set min date to today ----------
  const dateInput = $('#date');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  // ---------- Form validation ----------
  const validators = {
    firstName: v => v.trim().length >= 2 || 'Please enter your first name.',
    lastName: v => v.trim().length >= 2 || 'Please enter your last name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email address.',
    phone: v => /^[\d+\-\s()]{7,20}$/.test(v.trim()) || 'Enter a valid phone number.',
    service: v => v.trim() !== '' || 'Please select a service.',
    date: v => {
      if (!v) return 'Please choose a preferred date.';
      const d = new Date(v);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return d >= today || 'Please select a future date.';
    },
    time: v => v.trim() !== '' || 'Please choose a time slot.',
    consent: (v, el) => el.checked || 'Please accept the consent to continue.'
  };

  const showError = (group, msg) => {
    group.classList.add('invalid');
    const err = group.querySelector('.error');
    if (err) err.textContent = msg;
  };
  const clearError = (group) => {
    group.classList.remove('invalid');
    const err = group.querySelector('.error');
    if (err) err.textContent = '';
  };

  const validateField = (el) => {
    const name = el.name;
    const rule = validators[name];
    if (!rule) return true;
    const group = el.closest('.form-group') || el.closest('.check-group');
    if (!group) return true;
    const result = rule(el.value, el);
    if (result === true) {
      clearError(group);
      return true;
    } else {
      showError(group, result);
      return false;
    }
  };

  if (form) {
    // Live validation on blur
    $$('input, select, textarea', form).forEach(el => {
      el.addEventListener('blur', () => validateField(el));
      el.addEventListener('input', () => {
        const group = el.closest('.form-group') || el.closest('.check-group');
        if (group && group.classList.contains('invalid')) validateField(el);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      Object.keys(validators).forEach(name => {
        const el = form.elements[name];
        if (el && !validateField(el)) valid = false;
      });
      if (!valid) {
        const firstInvalid = form.querySelector('.form-group.invalid, .check-group.invalid');
        firstInvalid && firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Simulate submission (replace with real endpoint)
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      const data = Object.fromEntries(new FormData(form).entries());
      // For demo: log data so developers can wire up a real backend
      console.log('Booking request:', data);

      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        form.style.display = 'none';
        successBox.hidden = false;
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Reset after 6s so the form can be reused
        setTimeout(() => {
          form.reset();
          form.style.display = '';
          successBox.hidden = true;
          closeModal();
        }, 6000);
      }, 1200);
    });
  }
})();
