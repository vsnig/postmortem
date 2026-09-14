// Generic blocker: reads CF_SITE (from the site adapter loaded before this file),
// marks matching elements with data-cf-blocked while armed, and swallows their input events.

(() => {
  const ATTR = 'data-cf-blocked';
  const STYLE_ID = 'cf-style';
  const BANNER_ID = 'cf-banner';
  const CSS = `
    [${ATTR}] { opacity: .25 !important; filter: grayscale(1) !important; cursor: not-allowed !important; }
    #${BANNER_ID} {
      position: fixed; right: 12px; bottom: 12px; z-index: 2147483647;
      background: #1b1b1b; color: #eee; font: 13px/1.4 system-ui, sans-serif;
      padding: 8px 12px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,.45);
      pointer-events: none; transition: transform .15s;
    }
    #${BANNER_ID}.cf-shake { transform: translateX(-6px); }
  `;

  let armedUntil = 0;
  let observer = null;
  let scanTimer = null;
  let expiryTimer = null;
  let bannerTimer = null;

  // MARK: helpers
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const isArmed = () => armedUntil > Date.now();

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  function activeRules() {
    return CF_SITE.rules.filter((r) => !r.path || r.path.test(location.pathname));
  }

  // MARK: scan
  function scan() {
    scanTimer = null;
    if (!isArmed()) return;
    const hits = new Set();
    for (const r of activeRules()) {
      for (const sel of r.selectors || []) document.querySelectorAll(sel).forEach((el) => hits.add(el));
      if (r.text) {
        document.querySelectorAll('button, a, [role="button"]').forEach((el) => {
          if (r.text.test(norm(el.textContent))) hits.add(el);
        });
      }
    }
    document.querySelectorAll(`[${ATTR}]`).forEach((el) => {
      if (!hits.has(el)) el.removeAttribute(ATTR);
    });
    hits.forEach((el) => el.setAttribute(ATTR, '1'));
  }

  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(scan, 150);
  }

  // MARK: banner
  function minutesLeft() {
    return Math.max(1, Math.ceil((armedUntil - Date.now()) / 60000));
  }

  function renderBanner() {
    let b = document.getElementById(BANNER_ID);
    if (!isArmed()) {
      b?.remove();
      return;
    }
    if (!b) {
      b = document.createElement('div');
      b.id = BANNER_ID;
      (document.body || document.documentElement).appendChild(b);
    }
    b.textContent = `Chess Focus · new games blocked · ${minutesLeft()} min left`;
  }

  function shakeBanner() {
    const b = document.getElementById(BANNER_ID);
    if (!b) return;
    b.classList.add('cf-shake');
    setTimeout(() => b.classList.remove('cf-shake'), 150);
  }

  // MARK: input interception (capture phase, so the page never sees it)
  const blockedTarget = (e) => isArmed() && e.target instanceof Element && e.target.closest(`[${ATTR}]`);

  function swallow(e) {
    if (!blockedTarget(e)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    shakeBanner();
  }

  function swallowKey(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (!isArmed()) return;
    const a = document.activeElement;
    if (a && a.closest(`[${ATTR}]`)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      shakeBanner();
    }
  }

  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'auxclick', 'touchstart', 'touchend']) {
    window.addEventListener(t, swallow, true);
  }
  window.addEventListener('keydown', swallowKey, true);

  // MARK: arm / disarm
  function setArmed(until) {
    armedUntil = until > Date.now() ? until : 0;
    clearTimeout(expiryTimer);
    clearInterval(bannerTimer);
    if (isArmed()) {
      ensureStyle();
      if (!observer) {
        observer = new MutationObserver(scheduleScan);
        observer.observe(document.documentElement, { childList: true, subtree: true, attributes: false });
      }
      scan();
      renderBanner();
      bannerTimer = setInterval(renderBanner, 30000);
      expiryTimer = setTimeout(() => setArmed(0), armedUntil - Date.now() + 50);
    } else {
      observer?.disconnect();
      observer = null;
      document.querySelectorAll(`[${ATTR}]`).forEach((el) => el.removeAttribute(ATTR));
      renderBanner();
    }
  }

  // MARK: storage sync
  chrome.storage.local.get('armedUntil').then(({ armedUntil = 0 }) => setArmed(armedUntil));
  chrome.storage.onChanged.addListener((ch, area) => {
    if (area === 'local' && ch.armedUntil) setArmed(ch.armedUntil.newValue || 0);
  });
})();
