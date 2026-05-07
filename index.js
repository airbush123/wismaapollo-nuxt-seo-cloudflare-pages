// Wisma Apollo – Dark Mobile JS
(function () {
    'use strict';

    // --- Navbar scroll ---
    var nav = document.getElementById('nav');
    var lastY = 0;
    window.addEventListener('scroll', function () {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        lastY = window.scrollY;
    }, { passive: true });

    // --- Hamburger ---
    var btn = document.getElementById('menuBtn');
    var menu = document.getElementById('mobileMenu');
    btn.addEventListener('click', function () {
        btn.classList.toggle('open');
        menu.classList.toggle('open');
    });
    // Close menu on link click
    menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
            btn.classList.remove('open');
            menu.classList.remove('open');
        });
    });

    // --- Scroll animations (IntersectionObserver) ---
    var els = document.querySelectorAll('.anim-up');
    if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        els.forEach(function (el) { obs.observe(el); });
    } else {
        // Fallback: show all
        els.forEach(function (el) { el.classList.add('visible'); });
    }

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var id = this.getAttribute('href');
            if (id.length < 2) return;
            var target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                var top = target.getBoundingClientRect().top + window.pageYOffset - 60;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // --- Lazy-load iframes (map) ---
    var iframes = document.querySelectorAll('iframe[data-src]');
    if ('IntersectionObserver' in window && iframes.length) {
        var iframeObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.src = e.target.getAttribute('data-src');
                    iframeObs.unobserve(e.target);
                }
            });
        }, { rootMargin: '200px' });
        iframes.forEach(function (f) { iframeObs.observe(f); });
    } else {
        iframes.forEach(function (f) { f.src = f.getAttribute('data-src'); });
    }

})();
