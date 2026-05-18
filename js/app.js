/* ============================================================
   MAIN APP JS — CallPro AZ
   ============================================================ */

'use strict';

// ─── State ────────────────────────────────────────────────────
const APP = {
  lang:  localStorage.getItem('cp_lang')  || 'az',
  theme: localStorage.getItem('cp_theme') || 'dark',
};

// ─── DOM Ready ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLang();
  initNav();
  initScrollReveal();
  initCounters();
  initFAQ();
  initCursorGlow();
  initCookies();
  initScrollTop();
  initLoadingScreen();
  initRangeInputs();
  initFormValidation();
  initPageAnimations();
});

// ─── Loading Screen ───────────────────────────────────────────
function initLoadingScreen() {
  const screen = document.querySelector('.loading-screen');
  if (!screen) return;
  setTimeout(() => screen.classList.add('done'), 2000);
}

// ─── Theme ────────────────────────────────────────────────────
function initTheme() {
  applyTheme(APP.theme);
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      APP.theme = APP.theme === 'dark' ? 'light' : 'dark';
      applyTheme(APP.theme);
      localStorage.setItem('cp_theme', APP.theme);
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// ─── Language ─────────────────────────────────────────────────
function initLang() {
  applyLang(APP.lang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const dropdown = btn.nextElementSibling;
      btn.classList.toggle('open');
      dropdown.classList.toggle('open');
    });
  });

  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const lang = opt.dataset.lang;
      APP.lang = lang;
      localStorage.setItem('cp_lang', lang);
      applyLang(lang);
      // Update active states
      document.querySelectorAll('.lang-option').forEach(o => o.classList.toggle('active', o.dataset.lang === lang));
      // Update button text
      document.querySelectorAll('.lang-btn .lang-current').forEach(el => el.textContent = lang.toUpperCase());
      // Close dropdowns
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('open'));
      document.querySelectorAll('.lang-dropdown').forEach(d => d.classList.remove('open'));
    });
  });

  // Close on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('open'));
    document.querySelectorAll('.lang-dropdown').forEach(d => d.classList.remove('open'));
  });
}

function applyLang(lang) {
  const T = window.TRANSLATIONS?.[lang];
  if (!T) return;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (T[key] !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = T[key];
      } else if (el.tagName === 'OPTION') {
        el.textContent = T[key];
      } else {
        el.textContent = T[key];
      }
    }
  });

  const titleEl = document.querySelector('title[data-i18n]');
  if (!titleEl) {
    const pageTitle = T.page_title;
    if (pageTitle) document.title = pageTitle;
  }
  document.querySelectorAll('meta[data-i18n]').forEach(meta => {
    const key = meta.dataset.i18n;
    if (T[key] !== undefined) {
      meta.setAttribute('content', T[key]);
    }
  });

  // Update html lang attr
  document.documentElement.lang = lang === 'az' ? 'az' : lang === 'ru' ? 'ru' : 'en';
}

// ─── Navigation ───────────────────────────────────────────────
function initNav() {
  const nav      = document.querySelector('.nav');
  const hamburger= document.querySelector('.nav__hamburger');
  const mobile   = document.querySelector('.nav__mobile');
  const progress = document.querySelector('.nav__progress');
  if (!nav) return;

  // Scroll effects
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 40;
    nav.classList.toggle('scrolled', scrolled);

    // Progress bar
    if (progress) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (window.scrollY / docH * 100) + '%';
    }
  }, { passive: true });

  // Hamburger
  if (hamburger && mobile) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobile.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  // Active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ─── Scroll Reveal ────────────────────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

// ─── Counters ─────────────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animateCounter(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const dec    = el.dataset.dec || 0;
  const dur    = 2000;
  const step   = 16;
  let current  = 0;
  const steps  = dur / step;
  const inc     = target / steps;

  const timer = setInterval(() => {
    current += inc;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = prefix + current.toFixed(dec) + suffix;
  }, step);
}

// ─── FAQ ──────────────────────────────────────────────────────
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;

    q.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0';
    });
  });
}

// ─── Cursor Glow ──────────────────────────────────────────────
function initCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;

  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  function raf() {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(raf);
  }
  raf();
}

// ─── Cookies Banner ───────────────────────────────────────────
function initCookies() {
  const banner = document.querySelector('.cookies-banner');
  if (!banner) return;
  if (localStorage.getItem('cp_cookies')) return;

  setTimeout(() => banner.classList.add('show'), 2500);

  banner.querySelector('.cookie-accept')?.addEventListener('click', () => {
    localStorage.setItem('cp_cookies', '1');
    banner.classList.remove('show');
  });
  banner.querySelector('.cookie-decline')?.addEventListener('click', () => {
    banner.classList.remove('show');
  });
}

// ─── Scroll To Top ────────────────────────────────────────────
function initScrollTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ─── Range Inputs ─────────────────────────────────────────────
function initRangeInputs() {
  document.querySelectorAll('input[type="range"]').forEach(input => {
    const output = document.querySelector(`[data-range-output="${input.id}"]`);
    if (!output) return;

    function update() {
      const val = parseInt(input.value);
      output.textContent = val >= 10000 ? '10,000+' : val.toLocaleString();
      // Visual fill
      const pct = (val - input.min) / (input.max - input.min) * 100;
      input.style.background = `linear-gradient(to right, var(--accent) ${pct}%, var(--border) ${pct}%)`;
    }

    input.addEventListener('input', update);
    update();
  });
}

// ─── Form Validation ──────────────────────────────────────────
function initFormValidation() {
  document.querySelectorAll('.needs-validation').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (validateForm(form)) submitForm(form);
    });
  });
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    clearError(field);
    if (!field.value.trim()) {
      showError(field, getValidationMsg('required'));
      valid = false;
    } else if (field.type === 'email' && !isValidEmail(field.value)) {
      showError(field, getValidationMsg('email'));
      valid = false;
    } else if (field.type === 'tel' && field.value && !isValidPhone(field.value)) {
      showError(field, getValidationMsg('phone'));
      valid = false;
    }
  });
  return valid;
}

function showError(field, msg) {
  field.classList.add('error');
  const err = document.createElement('span');
  err.className = 'form-error';
  err.innerHTML = `⚠ ${msg}`;
  field.parentNode.appendChild(err);
}

function clearError(field) {
  field.classList.remove('error');
  field.parentNode.querySelectorAll('.form-error').forEach(e => e.remove());
}

function getValidationMsg(type) {
  const T = window.TRANSLATIONS?.[APP.lang] || {};
  const msgs = {
    az: { required: 'Bu sahə tələb olunur', email: 'Düzgün e-mail daxil edin', phone: 'Düzgün telefon daxil edin' },
    en: { required: 'This field is required', email: 'Enter a valid email', phone: 'Enter a valid phone' },
    ru: { required: 'Это поле обязательно', email: 'Введите корректный email', phone: 'Введите корректный телефон' },
  };
  return msgs[APP.lang]?.[type] || msgs.az[type];
}

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isValidPhone(v) { return /^[\d\s\+\-\(\)]{7,}$/.test(v); }

async function submitForm(form) {
  const btn = form.querySelector('.btn-submit');
  if (btn) btn.classList.add('loading');

  // Simulate API call
  await new Promise(r => setTimeout(r, 1800));

  if (btn) btn.classList.remove('loading');

  const formBody = form.querySelector('.form-body');
  const success  = form.querySelector('.form-success');

  if (formBody) formBody.style.display = 'none';
  if (success)  success.classList.add('visible');
  else          showFormSuccessToast();
}

function showFormSuccessToast() {
  const T = window.TRANSLATIONS?.[APP.lang] || {};
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:32px;right:32px;z-index:9999;
    background:var(--bg-card);border:1px solid rgba(34,197,94,0.3);
    border-radius:var(--radius-md);padding:16px 20px;
    display:flex;align-items:center;gap:12px;
    box-shadow:var(--shadow-lg);
    transform:translateY(80px);transition:transform 0.4s var(--ease);
  `;
  toast.innerHTML = `<span style="font-size:1.5rem">✅</span><div><strong>${T.form_success_t||'Göndərildi!'}</strong><br><small style="color:var(--text-muted)">${T.form_success_d||''}</small></div>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.style.transform = 'translateY(0)');
  setTimeout(() => {
    toast.style.transform = 'translateY(80px)';
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// ─── Page-specific animations ─────────────────────────────────
function initPageAnimations() {
  // Parallax for hero bg
  const heroBg = document.querySelector('.hero__bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    }, { passive: true });
  }

  // Pricing toggle (monthly/yearly placeholder)
  const pricingToggle = document.querySelector('.pricing-toggle');
  if (pricingToggle) {
    pricingToggle.addEventListener('change', () => {
      // Could implement yearly discount logic here
    });
  }

  // Number ticker for stat counters with +/suffix
  document.querySelectorAll('.stat-num').forEach(el => {
    const txt = el.textContent.trim();
    const num = parseFloat(txt.replace(/[^0-9.]/g, ''));
    const suf = txt.replace(/[0-9.]/g, '');
    if (!num) return;
    el.dataset.count  = num;
    el.dataset.suffix = suf;
    el.textContent    = '0' + suf;
  });

  initCounters();
}