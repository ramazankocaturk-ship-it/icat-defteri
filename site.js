(function () {
    // 1. Mobile Navigation Drawer
    var toggleBtn = document.getElementById('mobile-nav-toggle');
    var drawer = document.getElementById('mobile-nav-drawer');
    if (toggleBtn && drawer) {
        toggleBtn.addEventListener('click', function () {
            var expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
            toggleBtn.setAttribute('aria-expanded', String(!expanded));
            drawer.classList.toggle('open', !expanded);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drawer.classList.contains('open')) {
                toggleBtn.setAttribute('aria-expanded', 'false');
                drawer.classList.remove('open');
                toggleBtn.focus();
            }
        });
    }

    // 2. Mobile Collapsible Table of Contents
    var tocBtn = document.getElementById('mobile-toc-btn');
    var tocPanel = document.getElementById('mobile-toc-panel');
    if (tocBtn && tocPanel) {
        tocBtn.addEventListener('click', function () {
            var expanded = tocBtn.getAttribute('aria-expanded') === 'true';
            tocBtn.setAttribute('aria-expanded', String(!expanded));
            tocPanel.classList.toggle('open', !expanded);
        });
        tocPanel.addEventListener('click', function (e) {
            if (e.target && e.target.tagName === 'A') {
                tocBtn.setAttribute('aria-expanded', 'false');
                tocPanel.classList.remove('open');
            }
        });
    }

    // 3. Scroll-Spy for Sticky Left Section Rail & Mobile TOC
    function initScrollSpy() {
        var sections = document.querySelectorAll('.doc-section[id]');
        if (!sections.length) return;
        var allLinks = document.querySelectorAll('.toc-list a[href^="#"]');
        if (!allLinks.length) return;

        function setActive(id) {
            allLinks.forEach(function (a) {
                var match = a.getAttribute('href') === '#' + id;
                a.classList.toggle('active', match);
            });
        }

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        setActive(entry.target.id);
                    }
                });
            }, {
                rootMargin: '-18% 0px -68% 0px',
                threshold: 0
            });
            sections.forEach(function (sec) { observer.observe(sec); });
        }

        setActive(sections[0].id);
    }

    window.IcatSiteInitScrollSpy = initScrollSpy;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollSpy);
    } else {
        initScrollSpy();
    }
})();
