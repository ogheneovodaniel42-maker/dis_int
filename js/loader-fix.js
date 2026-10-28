/*
 * Fallback preloader script.
 *
 * The site's original bundles (app.js / runtime.js / vendors.js) were
 * missing or empty in this export, so nothing ever animated the
 * ".loader" overlay's percentage or removed it from the page — it's a
 * fixed, full-screen element, so it blocked the entire site forever.
 *
 * This is a minimal, dependency-free replacement: it counts the
 * percentage up to 100, fills the progress bar, then fades the
 * overlay out and removes it. It does NOT restore any other behavior
 * that may have lived in the original bundle (e.g. page-transition
 * animations, menu interactions) — it only unblocks the page.
 */
(function () {
  function init() {
    var loader = document.querySelector('.loader');
    if (!loader) return;

    var valueEl = loader.querySelector('.loader__value span');
    var barEl = loader.querySelector('.loader__progress--inner');

    var duration = 700; // ms
    var start = null;

    function tick(timestamp) {
      if (start === null) start = timestamp;
      var elapsed = timestamp - start;
      var pct = Math.min(100, Math.round((elapsed / duration) * 100));

      if (valueEl) valueEl.textContent = pct;
      if (barEl) barEl.style.width = pct + '%';

      if (pct < 100) {
        window.requestAnimationFrame(tick);
      } else {
        finish();
      }
    }

    function finish() {
      loader.style.transition = 'opacity 0.4s ease';
      loader.style.opacity = '0';
      window.setTimeout(function () {
        if (loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
        document.body.style.overflow = '';
      }, 400);
    }

    // Don't let the overlay block scrolling once we start closing it.
    window.requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Safety net: if something above ever throws, force-remove the
  // loader after 4s so the site is never permanently blocked.
  window.setTimeout(function () {
    var loader = document.querySelector('.loader');
    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }
  }, 4000);
})();
