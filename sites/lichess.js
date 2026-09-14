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
};
