const $ = (id) => document.getElementById(id);

async function load() {
  const s = await cfGetSettings();
  $('durationMin').value = s.durationMin;
  $('autoOpenAnalysis').checked = s.autoOpenAnalysis;
}

let savedTimer;
async function save() {
  const durationMin = Math.min(720, Math.max(1, parseInt($('durationMin').value, 10) || CF_DEFAULTS.durationMin));
  $('durationMin').value = durationMin;
  await chrome.storage.sync.set({ durationMin, autoOpenAnalysis: $('autoOpenAnalysis').checked });
  $('saved').textContent = 'Saved';
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => ($('saved').textContent = ''), 1200);
}

$('durationMin').addEventListener('change', save);
$('autoOpenAnalysis').addEventListener('change', save);
load();
