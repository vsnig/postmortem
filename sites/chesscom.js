// Site adapter: chess.com
// chess.com class names churn, so this leans on button text rather than selectors.
var CF_SITE = {
  name: 'chess.com',
  rules: [
    // Game over modal + post-game side panel: "Rematch", "New 3 min", "New Game", "Play Again"
    { text: /^(rematch|new game|play again|next game|new \d+ ?(min|sec)(ute|ond)?s?)$/i },
    // Play pages: the big "Play" / "Start Game" buttons and the nav "Play" link
    { path: /^\/(play|home|game|live)/, text: /^(play|start game)$/i },
  ],
};
