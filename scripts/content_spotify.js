// content_spotify.js (Ultra Sync - silent patched)
console.log("%c🎵 Spotify Tracker Ultra-Sync (silent)", "color:#1db954");

function safeSend(data) {
  try {
    chrome.runtime.sendMessage(data, () => {
      if (chrome.runtime.lastError) return;
    });
  } catch (_) {}
}

const SELECTORS = Object.freeze({
  WIDGET: '[data-testid="now-playing-widget"]',
  TITLE: '[data-testid="context-item-info-title"]',
  CHANNEL: '[data-testid="context-item-info-subtitles"]',
  IMG: "img",
  PLAY: '[data-testid="control-button-play"]',
  PLAYPAUSE: '[data-testid="control-button-playpause"]',
  NEXT: '[data-testid="control-button-skip-forward"]',
  PREV: '[data-testid="control-button-skip-back"]'
});

function scrapeSpotify() {
  const widget = document.querySelector(SELECTORS.WIDGET);
  if (!widget) return null;
  const title = widget.querySelector(SELECTORS.TITLE)?.innerText?.trim();
  if (!title) return null;
  const channel = widget.querySelector(SELECTORS.CHANNEL)?.innerText?.trim();
  const thumbnail = widget.querySelector(SELECTORS.IMG)?.src || null;
  const isPlaying = !document.querySelector(SELECTORS.PLAY);
  return { title, channel, thumbnail, isPlaying, url: location.href };
}

let last = null;
let lastTs = 0;
let timer = null;
const MIN_MS = 40;

function sendIfChanged(force = false) {
  const info = scrapeSpotify();
  if (!info) return;
  const changed = force || !last ||
    info.title !== last.title ||
    info.channel !== last.channel ||
    info.thumbnail !== last.thumbnail ||
    info.isPlaying !== last.isPlaying ||
    info.url !== last.url;
  if (!changed) return;
  const now = Date.now();
  if (!force && now - lastTs < MIN_MS) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      last = info; lastTs = Date.now(); safeSend({ type: "SPOTIFY_SONG_UPDATE", data: info }); timer = null;
    }, MIN_MS - (now - lastTs));
    return;
  }
  last = info; lastTs = now; safeSend({ type: "SPOTIFY_SONG_UPDATE", data: info });
}

let observer = null;
function observeSpotify() {
  const root = document.querySelector(SELECTORS.WIDGET);
  if (!root) {
    if (observer) { observer.disconnect(); observer = null; }
    return;
  }
  if (observer) return;
  observer = new MutationObserver(() => sendIfChanged(true));
  observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true });
}

chrome.runtime.onMessage.addListener((msg, sender, resp) => {
  if (msg.type === "REQUEST_SPOTIFY_INFO") { sendIfChanged(true); resp?.({ ok: true }); return true; }
  switch (msg.type) {
    case "TOGGLE_PLAY":
      document.querySelector(SELECTORS.PLAYPAUSE)?.click(); resp?.({ ok: true }); return true;
    case "NEXT_VIDEO":
      document.querySelector(SELECTORS.NEXT)?.click(); resp?.({ ok: true }); return true;
    case "PREV_VIDEO":
      document.querySelector(SELECTORS.PREV)?.click(); resp?.({ ok: true }); return true;
  }
  return true;
});

let mainInterval = setInterval(() => {
  observeSpotify();
  sendIfChanged(false);
}, 300);

setTimeout(() => { observeSpotify(); sendIfChanged(true); }, 200);

window.addEventListener("beforeunload", () => {
  clearInterval(mainInterval);
  if (observer) { observer.disconnect(); observer = null; }
  if (timer) { clearTimeout(timer); timer = null; }
}, { passive: true });
