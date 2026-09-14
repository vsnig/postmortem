// Settings live in chrome.storage.sync; the armed state lives in chrome.storage.local (see background.js).
var CF_DEFAULTS = { durationMin: 15, autoOpenAnalysis: false };

function cfGetSettings() {
  return chrome.storage.sync.get(CF_DEFAULTS).then((s) => ({ ...CF_DEFAULTS, ...s }));
}
