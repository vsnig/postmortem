// Site adapter: chess.com
// chess.com class names churn, so this leans on button text rather than selectors.
var CF_SITE = {
  name: 'chess.com',
  rules: [
    // Game over modal + post-game side panel: "Rematch", "New 3 min", "New Game", "Play Again"
    // Rematch only shows up after a game, so it doubles as the game-over event.
    { gameOver: true, selectors: ['.game-over-modal-content'], text: /^(rematch|new \d+ ?(min|sec)(ute|ond)?s?)$/i },
    { text: /^(new game|play again|next game)$/i },
    // Play pages: the big "Play" / "Start Game" buttons and the nav "Play" link
    { path: /^\/(play|home|game|live)/, text: /^(play|start game)$/i },
  ],
  // "Open analysis" target on the game-over overlay
  analysisText: /^(game review|review|analysis)$/i,
};
