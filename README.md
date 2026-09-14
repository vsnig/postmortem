# Postmortem

Chrome extension that stops the "one more game" reflex on Lichess and Chess.com.

Move six, and there it is again: that line you keep meaning to look up. You make a mental note, play on, and the game takes over. Thirty moves later it ends, your hand is already on Rematch, and the note is gone. Not forgotten, exactly. Overwritten, the way every game overwrites the one before it. By the end of the evening you have met the same opening three times and looked it up zero.

One click on the toolbar icon blocks Rematch / New game / Play again and the lobby quick-pairing
pane for 15 minutes (badge shows minutes left), and when a game ends a short overlay points you at
the analysis board, where the opening explorer lives, instead. Going to the analysis board (button or auto-open) restarts the block for the full duration.
Click the icon again to unblock.

It is not a wall: typing a URL still works. It only removes the automatic click.

Named after the chess postmortem: the analysis you do right after a game instead of starting the next one.
Store listing text: [STORE.md](STORE.md).

## Dev mode

1. `chrome://extensions` → enable **Developer mode** (top right).
2. **Load unpacked** → pick this folder.
3. Pin the icon. Click it: badge shows `15`, lichess/chess.com tabs show a bottom-right banner and dim the blocked buttons.

After editing files: click the ↻ reload button on the extension card, then reload the site tab.
Content-script logs are in the page's DevTools console; service-worker logs via the extension card's "service worker" link.

## Settings

Right-click the icon → Options (or the extension card → Details → Extension options):

- **Block new games for N minutes** (default 15). Applies to the next click on the icon.
- **Open the analysis board automatically when a game ends** (default off). While blocked, the game-over
  overlay navigates to the site's own analysis link after about a second instead of waiting for you to click it.

## Layout

- `background.js` — toolbar click toggles `armedUntil` in `chrome.storage.local`, badge countdown.
- `settings.js` — defaults + reader for settings in `chrome.storage.sync`; `options.html` / `options.js` — the settings page.
- `blocker.js` — generic blocker: marks matched elements, swallows their pointer/key events in capture phase, shows the banner.
- `sites/lichess.js`, `sites/chesscom.js` — per-site rules (`{ path?, selectors?, text? }`). chess.com class names churn, so its rules match button text.
- `scripts/make-icons.py` — placeholder icons.

## Adding a rule

Open the site, find the button, add either a CSS selector or a text regex to the site file. Text is
matched against the element's normalized `textContent` (`button`, `a`, `[role=button]`).

## Publishing

`scripts/pack.sh` builds `dist/postmortem-<version>.zip` for the Chrome Web Store (bump `version` in
`manifest.json` first). Listing text lives in `STORE.md`.
