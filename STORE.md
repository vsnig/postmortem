# Chrome Web Store listing — every field in dashboard order

Screenshots (1280×800, at least one) are made by hand; everything else is below.

## Store listing → Product details

**Title** (from manifest): Postmortem — stop the "one more game" reflex

**Summary** (from manifest, 128/132): Blocks Rematch / New Game on Lichess and Chess.com for 15 min, so the opening you meant to look up survives the end of the game.

**Description:**

Move six, and there it is again: that line you keep meaning to look up. You make a mental note, play on, and the game takes over. Thirty moves later it ends, your hand is already on Rematch, and the note is gone. Not forgotten, exactly. Overwritten, the way every game overwrites the one before it. By the end of the evening you have met the same opening three times and looked it up zero.

Postmortem holds that door shut. One click on the toolbar icon and, for the next 15 minutes, the one-click paths into a new game on Lichess and Chess.com are switched off: Rematch, New opponent, New game, Play again, and the lobby quick-pairing pane. When a game ends, a short "Game over. Postmortem time." overlay covers the buttons for five seconds and offers the site's own analysis board, where the opening explorer lives, instead. Going to the analysis board restarts the block. Click the icon again to unblock.

Settings: how many minutes to block, and whether to open the analysis board automatically when a game ends.

It is not a wall. You can still type a URL and play. It only removes the automatic click, so the decision to play another game is a decision again.

Use it to:
• explore an opening you just met while it is still fresh, instead of losing it to the next game
• stop playing "one more game" on Chess.com or Lichess when you are tilting
• actually look at your chess games instead of queueing the next one
• put a cooldown on blitz and bullet chess without blocking the sites entirely

Works on lichess.org and chess.com. No account, no data collection, nothing leaves your browser. Open source: https://github.com/vsnig/postmortem

**Category:** Productivity → Workflow & Planning (old single-level list: Productivity)

**Language:** English

## Store listing → Additional fields

- Homepage URL: https://github.com/vsnig/postmortem
- Support URL: https://github.com/vsnig/postmortem/issues
- Mature content: No

## Privacy

**Single purpose description:**
Temporarily disables the "new game" and "rematch" controls on lichess.org and chess.com so the user reviews the game they just played instead of reflexively starting another.

**Permission justifications:**

- `storage` — Stores the user's two settings (block duration, auto-open analysis) and the timestamp until which blocking is active.
- `alarms` — A once-per-minute alarm updates the toolbar badge with the minutes remaining in the block.
- Host permissions (lichess.org, www.chess.com) — The content script must run on these two sites to find and disable their rematch / new-game buttons and to show the game-over overlay. No other sites are accessed.

**Remote code:** No, I am not using remote code.

**Data usage:** tick nothing (no user data collected). **Certifications:** tick all three.

**Privacy policy URL:** leave empty (not required when no data is collected).

## Distribution

- Visibility: Public
- Payments: Free of charge
- Regions: All regions

## Keywords the copy is written to match

chess, lichess, chess.com, opening explorer, learn openings, tilt, chess addiction, rematch blocker, one more game, cooldown, focus
