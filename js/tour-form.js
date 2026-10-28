/* Schedule a Tour: popup open/close + form validation + thank-you state (static site, no backend) */
(function () {
  var NAME = 'Schedule a Tour';
  var popup, wrapper, current = null; // current = {target, placeholder}

  function els() {
    popup = popup || document.querySelector('.popup-form[data-popup]');
    wrapper = wrapper || (popup && popup.querySelector('[data-popup-wrapper]'));
    return popup && wrapper;
  }

  function open(trigger) {
    if (!els()) return;
    var host = trigger.closest('[data-form-target]') ||
      document.querySelector('[data-form-target="' + NAME + '"]');
    // the popup markup lives next to the trigger inside [data-form-target]
    if (!host || host.getAttribute('data-form-target') !== NAME) {
      var all = document.querySelectorAll('[data-form-target="' + NAME + '"]');
      // prefer the target that follows this trigger in the DOM
      host = null;
      for (var i = 0; i < all.length; i++) {
        if (trigger.compareDocumentPosition(all[i]) & Node.DOCUMENT_POSITION_FOLLOWING) { host = all[i]; break; }
      }
      host = host || all[0];
    }
    var target = host && host.querySelector('[data-popup-target]');
    if (!target) return;
    close();
    target.classList.remove('sent');
    var form = target.querySelector('form.tour-form'); if (form) form.reset();
    current = { host: host, target: target };
    wrapper.appendChild(target);
    popup.classList.add('open');
    document.documentElement.classList.add('tour-popup-open');
    var first = target.querySelector('input'); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 50);
  }

  function close() {
    if (!current) return;
    popup.classList.remove('open');
    document.documentElement.classList.remove('tour-popup-open');
    current.host.appendChild(current.target);
    current = null;
  }

  // Open (capture phase so it works even if the original site JS is broken/missing)
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-popup-trigger][data-form="' + NAME + '"]');
    if (t) { e.preventDefault(); e.stopPropagation(); open(t); return; }
    if (!current) return;
    if (e.target.closest('[data-popup-close]') || e.target === popup || e.target === wrapper) close();
  }, true);

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('form.tour-form');
    if (!form) return;
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var target = form.closest('[data-popup-target]');
    if (target) target.classList.add('sent');
    // Hook: submitted data available here if you later connect a backend
    document.dispatchEvent(new CustomEvent('tourform:submit', { detail: Object.fromEntries(new FormData(form)) }));
  });

  // Block past dates
  document.addEventListener('focusin', function (e) {
    var el = e.target;
    if (el.matches && el.matches('input[type=date][name=tour-date]') && !el.min) {
      el.min = new Date().toISOString().split('T')[0];
    }
  });

  // Safety: never let the preloader overlay block clicks for long
  function clearLoader() {
    var l = document.querySelector('.loader');
    if (l && l.parentNode) { l.style.pointerEvents = 'none'; l.style.opacity = '0'; setTimeout(function () { if (l.parentNode) l.parentNode.removeChild(l); }, 400); }
  }
  setTimeout(clearLoader, 4500);
})();
