// content_youtube.js (Ultra Sync - silent patched)
console.log("%c🎧 YT Tracker (Ultra Sync - silent)", "color:#00eaff");

function safeSend(data) {
  try {
    chrome.runtime.sendMessage(data, () => {
      if (chrome.runtime.lastError) return;
    });
  } catch (_) {}
}

let cachedVideo = null;
function getVideo() {
  if (cachedVideo && cachedVideo.isConnected) return cachedVideo;
  cachedVideo = document.querySelector("video");
  return cachedVideo;
}

const TITLE_SELECTORS = "h1 yt-formatted-string, h1.title yt-formatted-string";
const CHANNEL_SELECTORS = [
  "ytd-video-owner-renderer #channel-name a",
  "#owner #channel-name a",
  "ytd-channel-name yt-formatted-string a",
  "#text-container yt-formatted-string a"
];

function getFromPlayerResponse() {
  try {
    const resp = window.ytInitialPlayerResponse || window.ytplayer?.config?.args?.player_response;
    if (!resp) return null;
    const parsed = typeof resp === "string" ? JSON.parse(resp) : resp;
    const vd = parsed?.videoDetails;
    if (!vd) return null;
    return {
      title: (vd.title || "").trim(),
      channel: (vd.author || "").trim(),
      url: location.href,
      thumbnail: vd.thumbnail?.thumbnails?.slice(-1)[0]?.url || null,
      isPlaying: !(getVideo()?.paused ?? true)
    };
  } catch (_) { return null; }
}

function getTitleFromDOM() {
  return document.querySelector(TITLE_SELECTORS)?.textContent?.trim() ||
         document.title.replace(/ - YouTube$/, "");
}

function getChannelFromDOM() {
  for (const s of CHANNEL_SELECTORS) {
    const text = document.querySelector(s)?.textContent?.trim();
    if (text) return text;
  }
  return document.querySelector('meta[itemprop="author"]')?.getAttribute("content")?.trim() || null;
}

function getThumbFromUrl() {
  const id = new URL(location.href).searchParams.get("v");
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function buildInfo() {
  const p = getFromPlayerResponse();
  if (p?.title) {
    if (!p.thumbnail) p.thumbnail = getThumbFromUrl();
    return p;
  }
  const v = getVideo();
  if (!v) return null;
  const title = getTitleFromDOM();
  const channel = getChannelFromDOM();
  if (!title || !channel) return null;
  return { title, channel, url: location.href, thumbnail: getThumbFromUrl(), isPlaying: !v.paused };
}

let last = null;
let lastTs = 0;
let sendTimer = null;
const MIN_MS = 40;

function sendNow(force = false) {
  const info = buildInfo();
  if (!info) return;
  const changed = force || !last ||
    info.title !== last.title ||
    info.channel !== last.channel ||
    info.url !== last.url ||
    info.thumbnail !== last.thumbnail ||
    info.isPlaying !== last.isPlaying;
  if (!changed) return;
  const now = Date.now();
  if (!force && now - lastTs < MIN_MS) {
    if (sendTimer) clearTimeout(sendTimer);
    sendTimer = setTimeout(() => {
      last = info;
      lastTs = Date.now();
      safeSend({ type: "YOUTUBE_SONG_UPDATE", data: info });
      sendTimer = null;
    }, MIN_MS - (now - lastTs));
    return;
  }
  last = info;
  lastTs = now;
  safeSend({ type: "YOUTUBE_SONG_UPDATE", data: info });
}

const VIDEO_EVENTS = ["play", "pause", "playing", "timeupdate", "ratechange", "seeking", "seeked", "loadeddata", "loadedmetadata", "ended"];
const INFO_ROOTS = ["#info-contents", "#meta-contents", "h1.title", "#container"];
const eventHandler = () => sendNow(true);
const observerConfig = { passive: true };

let infoObserver = null;
let videoObservers = new WeakMap();

function attachToVideo() {
  const v = getVideo();
  if (!v) return;
  if (!v.__yt_tracker_attached) {
    v.__yt_tracker_attached = true;
    VIDEO_EVENTS.forEach(ev => v.addEventListener(ev, eventHandler, observerConfig));
    const mo = new MutationObserver(eventHandler);
    mo.observe(v, { attributes: true, attributeFilter: ["src"] });
    videoObservers.set(v, mo);
    sendNow(true);
  }
  INFO_ROOTS.forEach(sel => {
    const root = document.querySelector(sel);
    if (root && !root.__yt_info_observed) {
      root.__yt_info_observed = true;
      if (!infoObserver) infoObserver = new MutationObserver(eventHandler);
      infoObserver.observe(root, { subtree: true, childList: true, characterData: true });
    }
  });
}

function cleanupForOldVideo(v) {
  try {
    if (!v) return;
    if (v.__yt_tracker_attached) {
      VIDEO_EVENTS.forEach(ev => v.removeEventListener(ev, eventHandler, observerConfig));
      v.__yt_tracker_attached = false;
    }
    const mo = videoObservers.get(v);
    if (mo) { mo.disconnect(); videoObservers.delete(v); }
  } catch (_) {}
}

function onNavigate() {
  const old = cachedVideo;
  cachedVideo = null;
  last = null;
  if (old) cleanupForOldVideo(old);
  setTimeout(() => { attachToVideo(); sendNow(true); }, 120);
}

if (!history._yt_patched) {
  const _push = history.pushState;
  const _replace = history.replaceState;
  history.pushState = function() { _push.apply(this, arguments); onNavigate(); };
  history.replaceState = function() { _replace.apply(this, arguments); onNavigate(); };
  history._yt_patched = true;
}

window.addEventListener("popstate", onNavigate, { passive: true });
window.addEventListener("yt-navigate-finish", onNavigate, { passive: true });
window.addEventListener("yt-page-data-updated", eventHandler, { passive: true });

let lastUrl = location.href;
let urlCheckInterval = setInterval(() => {
  if (location.href !== lastUrl) { lastUrl = location.href; onNavigate(); }
}, 500);

let audioCtx = null;
let analyser = null;
let sourceNode = null;
let dataArr = null;
let visInterval = null;

function teardownVisualizer() {
  try {
    if (visInterval) { clearInterval(visInterval); visInterval = null; }
    if (analyser) { analyser.disconnect(); analyser = null; }
    if (sourceNode) { try { sourceNode.disconnect(); } catch (_) {} sourceNode = null; }
  } catch (_) {}
}

function setupVisualizer() {
  const v = getVideo();
  if (!v) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (!analyser) {
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      dataArr = new Uint8Array(analyser.frequencyBinCount);
    }
    if (sourceNode) {
      try { sourceNode.disconnect(); } catch (_) {}
      sourceNode = null;
    }
    try {
      sourceNode = audioCtx.createMediaElementSource(v);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (_) {}

    window.__yt_wake = () => {
      if (audioCtx?.state === "suspended") audioCtx.resume().catch(()=>{});
    };

    if (visInterval) clearInterval(visInterval);
    visInterval = setInterval(() => {
      if (!analyser) return;
      analyser.getByteFrequencyData(dataArr);
      let sum = 0;
      for (let i = 0; i < dataArr.length; i++) sum += dataArr[i];
      safeSend({ type: "VISUALIZER_LEVEL", level: (sum / dataArr.length) | 0 });
    }, 24);
  } catch (_) {}
}

const init = () => {
  attachToVideo();
  setupVisualizer();
  sendNow(true);

  const bodyObserver = new MutationObserver(() => {
    attachToVideo();
    sendNow(true);
  });
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("beforeunload", () => {
    try {
      clearInterval(urlCheckInterval);
      if (sendTimer) { clearTimeout(sendTimer); sendTimer = null; }
      if (visInterval) { clearInterval(visInterval); visInterval = null; }
      if (infoObserver) { infoObserver.disconnect(); infoObserver = null; }
      videoObservers.forEach((mo, el) => { mo.disconnect(); });
      videoObservers = new WeakMap();
      teardownVisualizer();
      if (audioCtx) { try { audioCtx.close(); } catch (_) {} audioCtx = null; }
    } catch (_) {}
  }, { passive: true });
};

setTimeout(init, 200);

chrome.runtime.onMessage.addListener((msg, sender, resp) => {
  const v = getVideo();
  if (msg?.type === "REQUEST_YT_INFO") { sendNow(true); resp?.({ ok: true }); return true; }
  if (!v) return;
  switch (msg.type) {
    case "TOGGLE_PLAY":
      v.paused ? v.play().catch(()=>{}) : v.pause();
      resp?.({ ok: true }); return true;
    case "NEXT_VIDEO":
      document.querySelector(".ytp-next-button")?.click();
      resp?.({ ok: true }); return true;
    case "PREV_VIDEO":
      const prev = document.querySelector(".ytp-prev-button");
      prev ? prev.click() : history.back();
      resp?.({ ok: true }); return true;
    case "WAKE_AUDIO_CONTEXT":
      window.__yt_wake?.(); return true;
  }
  return true;
});
