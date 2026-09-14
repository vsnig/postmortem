# Postmortem

Chrome extension. One click on the toolbar icon blocks the reflexive "next game" paths on
lichess.org and chess.com for 15 minutes (badge shows minutes left). Click again to unblock.

Named after the chess postmortem: the analysis you do right after a game instead of starting the next one.

The value is not a wall — typing a URL still works. It only removes the one-click reflex:
rematch / new game / play again buttons on the game-over screen, and the lobby quick-pairing pane.

## Dev mode

1. `chrome://extensions` → enable **Developer mode** (top right).
2. **Load unpacked** → pick this folder.
3. Pin the icon. Click it: badge shows `15`, lichess/chess.com tabs show a bottom-right banner and dim the blocked buttons.

After editing files: click the ↻ reload button on the extension card, then reload the site tab.
Content-script logs are in the page's DevTools console; service-worker logs via the extension card's "service worker" link.

## Layout

- `background.js` — toolbar click toggles `armedUntil` in `chrome.storage.local`, badge countdown.
- `blocker.js` — generic blocker: marks matched elements, swallows their pointer/key events in capture phase, shows the banner.
- `sites/lichess.js`, `sites/chesscom.js` — per-site rules (`{ path?, selectors?, text? }`). chess.com class names churn, so its rules match button text.
- `scripts/make-icons.py` — placeholder icons.

## Adding a rule

Open the site, find the button, add either a CSS selector or a text regex to the site file. Text is
matched against the element's normalized `textContent` (`button`, `a`, `[role=button]`).
