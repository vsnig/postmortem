importScripts('settings.js');

// MARK: state
async function armedUntil() {
  const { armedUntil = 0 } = await chrome.storage.local.get('armedUntil');
  return armedUntil > Date.now() ? armedUntil : 0;
}

async function refreshBadge() {
  const until = await armedUntil();
  if (!until) {
    await chrome.action.setBadgeText({ text: '' });
    return;
  }
  const min = Math.max(1, Math.ceil((until - Date.now()) / 60000));
  await chrome.action.setBadgeBackgroundColor({ color: '#c0392b' });
  await chrome.action.setBadgeText({ text: String(min) });
}

// MARK: toolbar click = toggle
chrome.action.onClicked.addListener(async () => {
  const cur = await armedUntil();
  const { durationMin } = await cfGetSettings();
  const next = cur ? 0 : Date.now() + durationMin * 60000;
  await chrome.storage.local.set({ armedUntil: next });
  await refreshBadge();
});

// MARK: badge countdown
chrome.alarms.create('tick', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(refreshBadge);
chrome.runtime.onInstalled.addListener(refreshBadge);
chrome.runtime.onStartup.addListener(refreshBadge);
chrome.storage.onChanged.addListener((ch, area) => {
  if (area === 'local' && ch.armedUntil) refreshBadge();
});
