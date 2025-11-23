// background.js (Ultra Sync - patched)
let currentSong = null;
let lastSent = 0;
const BROADCAST_MIN_MS = 100;
const STORAGE_DEBOUNCE_MS = 300;
const TAB_CHECK_DEBOUNCE_MS = 750;

let lastMusicTabId = null;
let musicWidgetEnabled = false; // Controls if background should process music
let _storageDebounceTimer = null;
let _tabCheckTimer = null;
let _broadcastTimer = null;

// Reusable message objects
const MSG_REQUEST_YT = Object.freeze({ type: "REQUEST_YT_INFO" });
const MSG_REQUEST_SPOTIFY = Object.freeze({ type: "REQUEST_SPOTIFY_INFO" });

const lastErrorHandler = () => { if (chrome.runtime.lastError) return; };

function safeSend(msg) {
  try { chrome.runtime.sendMessage(msg, lastErrorHandler); } catch (e) {}
}
function safeSendToTab(tabId, msg) {
  try { chrome.tabs.sendMessage(tabId, msg, lastErrorHandler); } catch (e) {}
}

function shouldSend(a, b) {
  if (!a && !b) return false;
  if (!a || !b) return true;
  return (
    a.title !== b.title ||
    a.channel !== b.channel ||
    a.url !== b.url ||
    a.thumbnail !== b.thumbnail ||
    a.isPlaying !== b.isPlaying ||
    (a.platform && b.platform && a.platform !== b.platform)
  );
}

function broadcast(payload) {
  const now = Date.now();
  if (now - lastSent >= BROADCAST_MIN_MS) {
    safeSend(payload);
    lastSent = now;
    if (_broadcastTimer) { clearTimeout(_broadcastTimer); _broadcastTimer = null; }
    return;
  }
  // schedule only one pending broadcast
  if (_broadcastTimer) return;
  _broadcastTimer = setTimeout(() => {
    safeSend(payload);
    lastSent = Date.now();
    _broadcastTimer = null;
  }, BROADCAST_MIN_MS - (now - lastSent));
}

const storageOps = {
  remove: () => chrome.storage.local.remove("currentSong", lastErrorHandler),
  set: () => chrome.storage.local.set({ currentSong }, lastErrorHandler)
};
function persistCurrentSongDebounced() {
  if (_storageDebounceTimer) clearTimeout(_storageDebounceTimer);
  _storageDebounceTimer = setTimeout(() => {
    (currentSong === null ? storageOps.remove() : storageOps.set());
    _storageDebounceTimer = null;
  }, STORAGE_DEBOUNCE_MS);
}

const URL_PATTERNS = {
  youtube: /youtube\.com/,
  spotify: /open\.spotify\.com/
};

function askTabForInfo(tabId) {
  if (!musicWidgetEnabled) return;
  if (!tabId) return;
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) return;
    if (!tab?.url) return;
    if (URL_PATTERNS.youtube.test(tab.url)) {
      safeSendToTab(tabId, MSG_REQUEST_YT);
    } else if (URL_PATTERNS.spotify.test(tab.url)) {
      safeSendToTab(tabId, MSG_REQUEST_SPOTIFY);
    }
  });
}

const MUSIC_URLS = ["*://www.youtube.com/*", "*://open.spotify.com/*"];

function checkMusicTabs() {
  if (!musicWidgetEnabled) {
    if (currentSong !== null) {
      currentSong = null;
      persistCurrentSongDebounced();
      broadcast({ type: "SONG_UPDATE", data: null });
    }
    lastMusicTabId = null;
    return;
  }
  chrome.tabs.query({ url: MUSIC_URLS }, (tabs) => {
    if (chrome.runtime.lastError) return;
    if (!tabs?.length) {
      if (currentSong !== null) {
        currentSong = null;
        persistCurrentSongDebounced();
        broadcast({ type: "SONG_UPDATE", data: null });
      }
      lastMusicTabId = null;
      return;
    }

    if (lastMusicTabId && tabs.some(t => t.id === lastMusicTabId)) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
      if (chrome.runtime.lastError) return;
      const active = activeTabs?.[0];
      if (active && (URL_PATTERNS.youtube.test(active.url) || URL_PATTERNS.spotify.test(active.url))) {
        lastMusicTabId = active.id;
        askTabForInfo(active.id);
        return;
      }
      lastMusicTabId = tabs[0].id;
      askTabForInfo(lastMusicTabId);
    });
  });
}

function scheduleTabCheck() {
  if (_tabCheckTimer) clearTimeout(_tabCheckTimer);
  _tabCheckTimer = setTimeout(() => {
    checkMusicTabs();
    _tabCheckTimer = null;
  }, TAB_CHECK_DEBOUNCE_MS);
}

function routeControlToActiveMusicTab(controlType) {
  if (!musicWidgetEnabled) return;
  const msg = { type: controlType };
  if (lastMusicTabId) {
    safeSendToTab(lastMusicTabId, msg);
    return;
  }
  // fallback search
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) return;
    const active = tabs?.[0];
    if (active && (URL_PATTERNS.youtube.test(active.url) || URL_PATTERNS.spotify.test(active.url))) {
      lastMusicTabId = active.id;
      safeSendToTab(active.id, msg);
      return;
    }
    chrome.tabs.query({ url: MUSIC_URLS }, (tabs2) => {
      if (chrome.runtime.lastError) return;
      if (tabs2?.[0]) {
        lastMusicTabId = tabs2[0].id;
        safeSendToTab(tabs2[0].id, msg);
      }
    });
  });
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!msg?.type) return;
  // Listen for widget state changes
  if (msg.type === "WIDGET_STATE_CHANGED" && msg.widget === "music") {
    musicWidgetEnabled = !!msg.enabled;
    // If disabled, clear state immediately
    if (!musicWidgetEnabled) {
      if (currentSong !== null) {
        currentSong = null;
        persistCurrentSongDebounced();
        broadcast({ type: "SONG_UPDATE", data: null });
      }
      lastMusicTabId = null;
    } else {
      scheduleTabCheck();
    }
    return;
  }
  switch (msg.type) {
    case "YOUTUBE_SONG_UPDATE":
    case "SPOTIFY_SONG_UPDATE": {
      const data = msg.data;
      if (!data?.title) return;
      data.platform = msg.type.startsWith("Y") ? "youtube" : "spotify";
      if (sender?.tab?.id) lastMusicTabId = sender.tab.id;
  if (!musicWidgetEnabled) return;
  if (!shouldSend(currentSong, data)) return;
  currentSong = data;
  persistCurrentSongDebounced();
  broadcast({ type: "SONG_UPDATE", data: currentSong });
  break;
    }
    case "REQUEST_CURRENT_SONG": {
  safeSend({ type: "SONG_UPDATE", data: musicWidgetEnabled ? (currentSong || null) : null });
  break;
    }
    case "VISUALIZER_LEVEL": {
      if (typeof msg.level === "number") broadcast({ type: "VISUALIZER_LEVEL", level: msg.level });
      break;
    }
    case "TOGGLE_PLAY":
    case "NEXT_VIDEO":
    case "PREV_VIDEO": {
      routeControlToActiveMusicTab(msg.type);
      break;
    }
    case "WAKE_AUDIO_CONTEXT": {
      if (lastMusicTabId) safeSendToTab(lastMusicTabId, { type: "WAKE_AUDIO_CONTEXT" });
      break;
    }
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (musicWidgetEnabled) {
    askTabForInfo(activeInfo.tabId);
    scheduleTabCheck();
  }
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo?.status && changeInfo.status !== "complete") return;
  if (musicWidgetEnabled) {
    if (tab?.url && (URL_PATTERNS.youtube.test(tab.url) || URL_PATTERNS.spotify.test(tab.url))) {
      askTabForInfo(tabId);
    }
    scheduleTabCheck();
  }
});
chrome.tabs.onCreated.addListener((tab) => {
  if (musicWidgetEnabled) {
    if (tab?.url && (URL_PATTERNS.youtube.test(tab.url) || URL_PATTERNS.spotify.test(tab.url))) {
      setTimeout(() => askTabForInfo(tab.id), 250);
    }
    scheduleTabCheck();
  }
});
chrome.tabs.onRemoved.addListener((tabId) => {
  if (musicWidgetEnabled) {
    if (tabId === lastMusicTabId) lastMusicTabId = null;
    scheduleTabCheck();
  }
});

// Startup load
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["currentSong", "musicWidgetEnabled"], (res) => {
    if (chrome.runtime.lastError) return;
    musicWidgetEnabled = !!res.musicWidgetEnabled;
    if (musicWidgetEnabled && res?.currentSong) {
      currentSong = res.currentSong;
      broadcast({ type: "SONG_UPDATE", data: currentSong });
    } else {
      currentSong = null;
      broadcast({ type: "SONG_UPDATE", data: null });
    }
  });
});
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("musicWidgetEnabled", (res) => {
    musicWidgetEnabled = !!res.musicWidgetEnabled;
    scheduleTabCheck();
  });
});

// Optional cleanup on suspend (MV3 may call this)
if (chrome.runtime.onSuspend) {
  chrome.runtime.onSuspend.addListener(() => {
    if (_storageDebounceTimer) clearTimeout(_storageDebounceTimer);
    if (_tabCheckTimer) clearTimeout(_tabCheckTimer);
    if (_broadcastTimer) clearTimeout(_broadcastTimer);
  });
}
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ New Tab Dashboard installed and background ready.");
});
