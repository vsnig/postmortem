// Generic blocker: reads CF_SITE (from the site adapter loaded before this file),
// marks matching elements with data-cf-blocked while armed, and swallows their input events.

(() => {
  const ATTR = 'data-cf-blocked';
  const STYLE_ID = 'cf-style';
  const BANNER_ID = 'cf-banner';
  const OVERLAY_ID = 'cf-overlay';
  const OVERLAY_MS = 5000;
  const CSS = `
    [${ATTR}] { opacity: .25 !important; filter: grayscale(1) !important; cursor: not-allowed !important; }
    #${BANNER_ID} {
      position: fixed; right: 12px; bottom: 12px; z-index: 2147483647;
      background: #1b1b1b; color: #eee; font: 13px/1.4 system-ui, sans-serif;
      padding: 8px 12px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,.45);
      pointer-events: none; transition: transform .15s;
    }
    #${BANNER_ID}.cf-shake { transform: translateX(-6px); }
    #${OVERLAY_ID} {
      position: fixed; inset: 0; z-index: 2147483646; display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,.55); backdrop-filter: blur(2px);
      font: 15px/1.4 system-ui, sans-serif; color: #eee;
      opacity: 1; transition: opacity .6s;
    }
    #${OVERLAY_ID}.cf-fade { opacity: 0; pointer-events: none; }
    #${OVERLAY_ID} .cf-card {
      background: #1b1b1b; padding: 28px 36px; border-radius: 12px; text-align: center;
      box-shadow: 0 6px 30px rgba(0,0,0,.6);
    }
    #${OVERLAY_ID} .cf-title { font-size: 26px; font-weight: 600; margin: 0 0 6px; }
    #${OVERLAY_ID} .cf-sub { opacity: .7; margin: 0 0 18px; }
    #${OVERLAY_ID} a.cf-go {
      display: inline-block; background: #c0392b; color: #fff; text-decoration: none;
      padding: 10px 18px; border-radius: 8px; font-weight: 600;
    }
  `;

  let armedUntil = 0;
  let observer = null;
  let scanTimer = null;
  let expiryTimer = null;
  let bannerTimer = null;
  let gameOverSeen = false; // gameOver rule currently matching
  let firstScan = true; // a finished game already on screen at load is not an event

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
    let gameOver = false;
    for (const r of activeRules()) {
      const before = hits.size;
      for (const sel of r.selectors || []) document.querySelectorAll(sel).forEach((el) => hits.add(el));
      if (r.text) {
        document.querySelectorAll('button, a, [role="button"]').forEach((el) => {
          if (r.text.test(norm(el.textContent))) hits.add(el);
        });
      }
      if (r.gameOver && hits.size > before) gameOver = true;
    }
    if (gameOver && !gameOverSeen && !firstScan) showOverlay();
    gameOverSeen = gameOver;
    firstScan = false;
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
    b.textContent = `Postmortem · new games blocked · ${minutesLeft()} min left`;
  }

  function shakeBanner() {
    const b = document.getElementById(BANNER_ID);
    if (!b) return;
    b.classList.add('cf-shake');
    setTimeout(() => b.classList.remove('cf-shake'), 150);
  }

  // MARK: game-over overlay (occupies the reflex second, then fades)
  function analysisHref() {
    for (const sel of CF_SITE.analysisSelectors || []) {
      const el = document.querySelector(sel);
      if (el?.href) return el.href;
    }
    if (CF_SITE.analysisText) {
      for (const el of document.querySelectorAll('a')) {
        if (CF_SITE.analysisText.test(norm(el.textContent)) && el.href) return el.href;
      }
    }
    return null;
  }

  function showOverlay() {
    document.getElementById(OVERLAY_ID)?.remove();
    const o = document.createElement('div');
    o.id = OVERLAY_ID;
    const card = document.createElement('div');
    card.className = 'cf-card';
    const h = document.createElement('p');
    h.className = 'cf-title';
    h.textContent = 'Game over. Postmortem time.';
    const sub = document.createElement('p');
    sub.className = 'cf-sub';
    sub.textContent = `That opening is still fresh. New games stay blocked for ${minutesLeft()} min.`;
    card.append(h, sub);
    const href = analysisHref();
    if (href) {
      const a = document.createElement('a');
      a.className = 'cf-go';
      a.href = href;
      a.textContent = 'Open the analysis board';
      card.append(a);
    }
    o.append(card);
    (document.body || document.documentElement).appendChild(o);
    setTimeout(() => {
      o.classList.add('cf-fade');
      setTimeout(() => o.remove(), 700);
    }, OVERLAY_MS);
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
      document.getElementById(OVERLAY_ID)?.remove();
      renderBanner();
    }
  }

  // MARK: storage sync
  chrome.storage.local.get('armedUntil').then(({ armedUntil = 0 }) => setArmed(armedUntil));
  chrome.storage.onChanged.addListener((ch, area) => {
    if (area === 'local' && ch.armedUntil) setArmed(ch.armedUntil.newValue || 0);
  });
})();
