/* İcat Defteri — Lightweight Interactive Site Controller (Zero Dependencies) */
(function () {
  'use strict';

  var STORAGE_KEY = 'icat_site_lang';
  var i18n = window.ICAT_I18N || { SUPPORTED_LANGS: ['tr'], DICT: {} };

  function resolveInitialLang() {
    try {
      var params = new URLSearchParams(window.location.search);
      var q = (params.get('lang') || '').toLowerCase();
      if (i18n.SUPPORTED_LANGS.indexOf(q) !== -1) return q;
    } catch (e) {}
    try {
      var saved = (localStorage.getItem(STORAGE_KEY) || '').toLowerCase();
      if (i18n.SUPPORTED_LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    return 'tr';
  }

  function applyLanguage(lang, persist) {
    if (i18n.SUPPORTED_LANGS.indexOf(lang) === -1) lang = 'tr';
    var pack = i18n.DICT[lang] || i18n.DICT.tr || {};
    document.documentElement.lang = lang;

    if (document.body && document.body.dataset.page === 'home') {
      if (pack.page_title) document.title = pack.page_title;
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && pack.page_desc) metaDesc.setAttribute('content', pack.page_desc);
    }

    var textNodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < textNodes.length; i++) {
      var el = textNodes[i];
      var key = el.getAttribute('data-i18n');
      if (key && Object.prototype.hasOwnProperty.call(pack, key)) {
        el.textContent = pack[key];
      }
    }

    var ariaNodes = document.querySelectorAll('[data-i18n-aria]');
    for (var j = 0; j < ariaNodes.length; j++) {
      var aEl = ariaNodes[j];
      var aKey = aEl.getAttribute('data-i18n-aria');
      if (aKey && Object.prototype.hasOwnProperty.call(pack, aKey)) {
        aEl.setAttribute('aria-label', pack[aKey]);
      }
    }

    var selects = document.querySelectorAll('#site-lang-select');
    for (var s = 0; s < selects.length; s++) {
      selects[s].value = lang;
    }

    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    }

    window.dispatchEvent(new CustomEvent('icat:langchange', { detail: { lang: lang } }));
  }

  function initLanguageSwitcher() {
    var initial = resolveInitialLang();
    applyLanguage(initial, false);

    var select = document.getElementById('site-lang-select');
    if (select) {
      select.addEventListener('change', function () {
        applyLanguage(select.value, true);
      });
    }
    window.ICAT_SET_LANG = function (lang) { applyLanguage(lang, true); };
  }

  function initMobileMenu() {
    var btn = document.getElementById('mobile-menu-toggle');
    var drawer = document.getElementById('mobile-drawer');
    if (!btn || !drawer) return;

    function setOpen(open) {
      drawer.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', function () {
      setOpen(!drawer.classList.contains('open'));
    });

    drawer.addEventListener('click', function (e) {
      if (e.target && e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) setOpen(false);
    });
  }

  function initFaqAccordion() {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    for (var i = 0; i < items.length; i++) {
      (function (item) {
        var trigger = item.querySelector('.faq-trigger');
        if (!trigger) return;
        trigger.addEventListener('click', function () {
          var willOpen = !item.classList.contains('open');
          for (var k = 0; k < items.length; k++) {
            items[k].classList.remove('open');
            var t = items[k].querySelector('.faq-trigger');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
          if (willOpen) {
            item.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
      })(items[i]);
    }
  }

  function initGalleryAndLightbox() {
    var track = document.getElementById('gallery-track');
    var prevBtn = document.getElementById('gallery-prev');
    var nextBtn = document.getElementById('gallery-next');
    var lightbox = document.getElementById('lightbox');
    var lbImg = document.getElementById('lightbox-img');
    var lbCap = document.getElementById('lightbox-caption');
    var lbClose = document.getElementById('lightbox-close');

    if (track && prevBtn && nextBtn) {
      prevBtn.addEventListener('click', function () {
        track.scrollBy({ left: -280, behavior: 'smooth' });
      });
      nextBtn.addEventListener('click', function () {
        track.scrollBy({ left: 280, behavior: 'smooth' });
      });
    }

    if (!lightbox || !lbImg || !lbCap) return;

    function openLightbox(src, caption) {
      lbImg.src = src;
      lbImg.alt = caption;
      lbCap.textContent = caption;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      if (lbClose) lbClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
    }

    var slides = document.querySelectorAll('.gallery-slide');
    for (var i = 0; i < slides.length; i++) {
      (function (slide) {
        function trigger() {
          var img = slide.querySelector('img');
          var cap = slide.querySelector('.gallery-caption');
          if (img) openLightbox(img.currentSrc || img.src, cap ? cap.textContent : img.alt);
        }
        slide.addEventListener('click', trigger);
        slide.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            trigger();
          }
        });
      })(slides[i]);
    }

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }

  function initDocToc() {
    var btn = document.getElementById('mobile-toc-btn');
    var panel = document.getElementById('mobile-toc-panel');
    if (btn && panel) {
      btn.addEventListener('click', function () {
        var isOpen = panel.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      panel.addEventListener('click', function (e) {
        if (e.target && e.target.closest('a')) {
          panel.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    var tocLinks = document.querySelectorAll('.doc-sidebar .toc-list a');
    var sections = document.querySelectorAll('.doc-section[id]');
    if (!tocLinks.length || !sections.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          for (var i = 0; i < tocLinks.length; i++) {
            tocLinks[i].classList.toggle('active', tocLinks[i].getAttribute('href') === '#' + id);
          }
        }
      });
    }, { rootMargin: '-90px 0px -65% 0px', threshold: 0.01 });

    for (var s = 0; s < sections.length; s++) observer.observe(sections[s]);
  }

  function initScrollReveal() {
    var nodes = document.querySelectorAll('.reveal');
    if (!nodes.length) return;
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.add('visible');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

    for (var j = 0; j < nodes.length; j++) io.observe(nodes[j]);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLanguageSwitcher();
    initMobileMenu();
    initFaqAccordion();
    initGalleryAndLightbox();
    initDocToc();
    initScrollReveal();
  });
})();
