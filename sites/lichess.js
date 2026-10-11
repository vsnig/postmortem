// Site adapter: lichess.org
// A rule = { path?: RegExp, selectors?: string[], text?: RegExp, gameOver?: true }
// gameOver: this rule matching for the first time on a page is treated as "the game just ended".
// Elements matched by selectors, or button/link elements whose text matches, get blocked while armed.
var CF_SITE = {
  name: 'lichess',
  rules: [
    // Game over panel under the board (its appearance = the game-over event)
    { gameOver: true, selectors: ['.follow-up .rematch', '.follow-up .new-opponent'] },
    { text: /^(rematch|new opponent|new game|play again)$/i },
    // Lobby: quick pairing pane + "Create a game / Play with a friend / Play with the computer"
    { path: /^\/$/, selectors: ['.lobby__app', '.lobby__start'] },
  ],
  // "Open analysis" target on the game-over overlay
  analysisSelectors: ['.follow-up a.analysis', 'a.fbt.analysis'],
  analysisText: /^analysis( board)?$/i,
  // Game page = /<8-char id>[/white|black]
  isGamePage: () => /^\/[A-Za-z0-9]{8}(\/(white|black))?$/.test(location.pathname),
  // Move list under the board. Lichess rotates its element tag names (today: moves are <Z7yx> inside <i5d>,
  // move numbers <qZM>), so never select by tag. The move being viewed carries class "a1t" (stable for years);
  // its ply = number of preceding move siblings (siblings whose text is not a bare move number) + 1.
  // Fallback: the "Analysis" button's href ends in #<ply> once the game is over.
  ply: () => {
    const cur = document.querySelector('.a1t');
    if (cur) {
      let ply = 1;
      for (let el = cur.previousElementSibling; el; el = el.previousElementSibling) {
        if (!/^\d+$/.test(el.textContent.trim())) ply++;
      }
      return { ply, san: cur.textContent.trim() };
    }
    const a = document.querySelector('a.fbt.analysis');
    const m = a?.getAttribute('href')?.match(/#(\d+)$/);
    return m ? { ply: parseInt(m[1], 10), san: '' } : null;
  },
  // Lichess analysis opens at #<ply>; the button's own hash is the final ply, replace it with the flagged one
  analysisAtPly: (href, ply) => `${href.split('#')[0]}#${ply}`,
};
