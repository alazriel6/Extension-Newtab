import React, { useEffect, useState, useCallback, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";

export default React.memo(function MiniMusicPlayerInner() {
  const [song, setSong] = useState(null);
  const { widgets } = useDashboard();
  const [playing, setPlaying] = useState(false);
  const [level, setLevel] = useState(0);
  const [hue, setHue] = useState(0);

  const isExtensionRef = useRef(typeof chrome !== "undefined" && chrome?.runtime?.sendMessage);
  const isExtension = isExtensionRef.current;

  const messageListener = useCallback((msg) => {
    if (!msg) return;
    if (msg.type === "SONG_UPDATE") {
      setSong(msg.data);
      if (typeof msg.data?.isPlaying === "boolean") setPlaying(msg.data.isPlaying);
    } else if (msg.type === "VISUALIZER_LEVEL" && typeof msg.level === "number") {
      setLevel(msg.level);
    }
  }, []);

  useEffect(() => {
    if (!widgets?.music) return;
    if (!isExtension) {
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        setSong({ title: "Local Preview Song", channel: "Dev Mode", thumbnail: "https://via.placeholder.com/150" });
        setPlaying(false);
      }
      return;
    }

  // safe initial request (one-shot)
  try { chrome.runtime.sendMessage({ type: "REQUEST_CURRENT_SONG" }, () => { if (chrome.runtime.lastError) return; }); } catch (e) {}

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
  // avoid sending extra messages on unmount that may error out
  try { chrome.runtime.sendMessage({ type: "DISABLE_VISUALIZER" }, () => { if (chrome.runtime.lastError) return; }); } catch (e) {}
    };
  }, [isExtension, widgets?.music, messageListener]);

  useEffect(() => {
    if (!widgets?.music) return;
    const newHue = (level * 3) % 360;
    if (Math.abs(newHue - hue) > 1) setHue(newHue);
  }, [level, widgets?.music]); // hue is state; acceptable to update

  const send = useCallback((type) => {
  if (!widgets?.music) return;
  setPlaying((p) => (type === "TOGGLE_PLAY" ? !p : p));
  if (!isExtension) return;
  try { chrome.runtime.sendMessage({ type }, () => { if (chrome.runtime.lastError) return; }); } catch (e) {}
  }, [isExtension, widgets?.music]);

if (!song) {
  return (
    <div className="absolute bottom-20 left-6 bg-black/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.45)] px-6 py-4 w-[350px] flex items-center justify-center text-white text-sm select-none">
      🎵 Tidak ada lagu yang diputar
    </div>
  );
}


  const visualizerRings = [...Array(4)].map((_, i) => {
    const size = 64 + (level * (i + 1)) / 4;
    const ringHue = (hue + i * 40) % 360;
    return {
      width: `${size}px`,
      height: `${size}px`,
      border: `2px solid hsl(${ringHue}, 90%, 65%)`,
      opacity: Math.max(0.08, 0.28 - i * 0.06),
      transition: "width 20ms linear, height 20ms linear",
      filter: `drop-shadow(0 0 ${6 + level / 3}px hsl(${ringHue}, 90%, 60%))`,
    };
  });

  const thumbnailStyle = {
    transform: `scale(${1 + level / 180}) rotate(${level / 20}deg)`,
    boxShadow: `0 0 ${12 + level / 1.8}px hsl(${hue}, 95%, 60%)`,
    transition: "transform 60ms ease-out, box-shadow 60ms ease-out",
  };

  const waveStyle = {
    width: "70%",
    background: `linear-gradient(90deg, hsl(${hue}, 90%, 65%), transparent)`,
    transform: `scaleX(${0.6 + level / 120})`,
    transition: "transform 80ms linear",
  };

  return (
    <div className="absolute bottom-20 left-6 bg-black/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.45)] px-4 py-3 w-[350px] flex items-center gap-4 select-none">
      <div className="relative flex items-center justify-center">
        {visualizerRings.map((style, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none" style={style} />
        ))}
        <img src={song.thumbnail} className={`w-16 h-16 rounded-full object-cover ${playing ? "animate-[spin_12s_linear_infinite]" : ""}`} style={thumbnailStyle} alt={song.title} />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 rounded-full" style={waveStyle} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold truncate">{song.title}</p>
        <p className="text-gray-300 text-xs truncate">{song.channel}</p>
      </div>

      <div className="flex gap-2 text-white">
        <button onClick={() => send("PREV_VIDEO")} aria-label="Previous"><SkipBack size={20} /></button>
        <button onClick={() => send("TOGGLE_PLAY")} aria-label="Play/Pause">{playing ? <Pause size={22} /> : <Play size={22} />}</button>
        <button onClick={() => send("NEXT_VIDEO")} aria-label="Next"><SkipForward size={20} /></button>
      </div>
    </div>
  );
});
