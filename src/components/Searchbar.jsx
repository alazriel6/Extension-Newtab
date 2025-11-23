import React, { useState, useEffect } from "react";
import { useDashboard } from "../context/DashboardContext";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const [engine, setEngine] = useState(() => localStorage.getItem("engine") || "google");

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("search_history")) || [];
    } catch {
      return [];
    }
  });

  const saveHistory = (q) => {
    if (!q.trim()) return;
    const newHistory = [q, ...history.filter((h) => h !== q)].slice(0, 8);
    setHistory(newHistory);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  /* ✅ OmniBox: URL */
  const detectUrl = (text) => {
    const isUrl = /^(https?:\/\/)?([\w-]+\.)+[\w]{2,}(\/.*)?$/i.test(text);
    if (!isUrl) return null;

    if (!/^https?:\/\//i.test(text)) return "https://" + text;
    return text;
  };

  /* ✅ AI Mode */
  const aiSearch = (text) => {
    if (!text.startsWith("@ai ")) return null;
    const prompt = text.replace("@ai ", "");
    return "https://chatgpt.com/?q=" + encodeURIComponent(prompt);
  };

  /* ✅ Special Shortcuts */
  const specialSearch = (text) => {
    const [cmd, ...rest] = text.split(" ");
    const q = rest.join(" ");
    if (!q) return null;

    const map = {
      "@yt": "https://www.youtube.com/results?search_query=",
      "@ig": "https://www.instagram.com/explore/search/keyword/?q=",
      "@x": "https://x.com/search?q=",
      "@gh": "https://github.com/search?q=",
    };

    if (map[cmd]) return map[cmd] + encodeURIComponent(q);
    return null;
  };

  /* ✅ Google Suggestions */
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const fetchSuggestions = async () => {
      try {
        const url =
          "https://suggestqueries.google.com/complete/search?client=firefox&q=" +
          encodeURIComponent(query);

        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        if (Array.isArray(data[1])) setSuggestions(data[1]);
      } catch {}
    };

    fetchSuggestions();
    return () => controller.abort();
  }, [query]);

  /* ✅ Engine Map */
  const engineMap = {
    google: "https://www.google.com/search?q=",
    bing: "https://www.bing.com/search?q=",
    ddg: "https://duckduckgo.com/?q=",
  };

  const toggleEngine = () => {
    const next =
      engine === "google" ? "bing" : engine === "bing" ? "ddg" : "google";
    setEngine(next);
    localStorage.setItem("engine", next);
  };

  /* ✅ Main Search */
  const handleSearch = () => {
    if (!query.trim()) return;

    const text = query.trim();

    const url =
      detectUrl(text) ||
      aiSearch(text) ||
      specialSearch(text) ||
      engineMap[engine] + encodeURIComponent(text) + "&animate=1";

    saveHistory(text);
    window.open(url, "_self");
  };

  /* ✅ ENTER */
  const onKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const { widgets } = useDashboard();
  if (!widgets.search) return null;

  return (
    <div className="w-full flex flex-col items-center mt-6 relative">
      {/* ✅ macOS-style search bar */}
      <div
        className={`flex items-center w-full max-w-xl px-5 py-3 rounded-full border backdrop-blur-xl transition-all duration-300
          ${focused ? 
            "scale-[1.04] shadow-[0_0_35px_var(--glow)] bg-black/80 border-white/80" 
            : 
            "bg-black/30 border-black/20"
          }
        `}
        style={{
          "--glow": window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "rgba(0,0,0,0.6)"
            : "rgba(0,0,0,0.25)",
        }}
      >
        {/* Engine */}
        <button
          onClick={toggleEngine}
          className="mr-3 text-white hover:text-white text-sm"
        >
          {engine === "google" && (
            <img src="/icons/Google.svg" className="w-5 h-5" />
          )}

          {engine === "bing" && (
            <img src="/icons/Bing.svg" className="w-5 h-5" />
          )}

          {engine === "ddg" && (
            <img src="/icons/Duckduckgo.svg" className="w-5 h-5" />
          )}
        </button>

        {/* Input */}
        <input
          type="text"
          placeholder="Search anything…"
          className="w-full bg-transparent text-white placeholder-white focus:outline-none text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />

        {/* 📷 Lens */}
        <button
          className="ml-3 text-white hover:text-white"
          onClick={() => window.open("https://lens.google.com", "_blank")}
        >
          📷
        </button>
      </div>

      {/* ✅ Dropdown */}
      {focused && (suggestions.length > 0 || history.length > 0) && (
        <div className="absolute top-full mt-2 w-full max-w-xl bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-2 animate-[fadeIn_0.25s_ease] z-1">
          {history.length > 0 && (
            <div className="flex justify-between items-center px-2 mb-1">
              <p className="text-white/40 text-xs">Recent Searches</p>
              <button
                className="text-white/50 text-xs hover:text-white"
                onClick={() => {
                  setHistory([]);
                  localStorage.setItem("search_history", "[]");
                }}
              >
                Clear
              </button>
            </div>
          )}

          {history.map((h, i) => (
            <div
              key={i}
              className="px-4 py-2 text-white/90 hover:bg-white/10 rounded-lg cursor-pointer"
              onMouseDown={() => {
                setQuery(h);
                handleSearch();
              }}
            >
              {h}
            </div>
          ))}

          {suggestions.map((s, idx) => (
            <div
              key={idx}
              className="px-4 py-2 text-white/90 hover:bg-white/10 rounded-lg cursor-pointer"
              onMouseDown={() => {
                setQuery(s);
                handleSearch();
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
