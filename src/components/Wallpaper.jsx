import React, { useEffect, useState, useRef } from "react";
import * as FFmpeg from "@ffmpeg/ffmpeg";
const { createFFmpeg, fetchFile } = FFmpeg;

import {
  saveVideoToDB,
  loadVideoFromDB,
  deleteVideoFromDB,
  saveImageToDB,
  loadImageFromDB,
  deleteImageFromDB,
} from "./db";

import { useTextColor } from "../context/ColorContext";

/* ========================================================
   🌆 Wallpaper Component (Optimized, Single File)
   ======================================================== */
export default function Wallpaper() {
  const [wallpaper, setWallpaper] = useState({ type: "default", source: null });
  const [loaded, setLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { setWallpaperType } = useTextColor();

  const hasLoaded = useRef(false);
  const videoRef = useRef(null);
  const keepAliveRef = useRef(null);
  const ffmpegRef = useRef(null);
  const highResBlob = useRef(null);
  const lowResBlob = useRef(null);

  /* ========================================================
     🧠 Lazy Load FFmpeg (1x only)
     ======================================================== */
  async function getFFmpeg() {
    if (ffmpegRef.current) return ffmpegRef.current;
    try {
      const instance = createFFmpeg({ log: false });
      await instance.load();
      ffmpegRef.current = instance;
      return instance;
    } catch {
      ffmpegRef.current = null;
      return null;
    }
  }

  /* ========================================================
     🗄️ Load Wallpaper (from storage or DB)
     ======================================================== */
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    requestIdleCallback(async () => {
      let saved =
        chrome?.storage?.local
          ? await new Promise((resolve) =>
              chrome.storage.local.get(["wallpaper"], (r) =>
                resolve(r.wallpaper)
              )
            )
          : JSON.parse(localStorage.getItem("wallpaper") || "null");

      if (!saved) {
        setLoaded(true);
        return;
      }

      if (saved.type === "image") {
        let blob = null;
        if (saved.source === "db") blob = await loadImageFromDB();
        setWallpaper({
          type: "image",
          source: blob ? URL.createObjectURL(blob) : saved.source,
        });
        setWallpaperType("image");
      }

      if (saved.type === "video") {
        const blob = await loadVideoFromDB();
        if (blob) {
          highResBlob.current = blob;
          setWallpaper({ type: "video", source: URL.createObjectURL(blob) });
          setWallpaperType("video");
        }
      }

      if (saved.type === "default") setWallpaperType("default");

      setLoaded(true);
    });

    return () => clearInterval(keepAliveRef.current);
  }, []);

  /* ========================================================
     🕐 Keep Video Alive (optional)
     ======================================================== */
  useEffect(() => {
    if (!loaded || wallpaper.type !== "video") return;
    const wake = () => {
      window.dispatchEvent(new Event("focus"));
      window.dispatchEvent(new Event("visibilitychange"));
    };
    wake();
    keepAliveRef.current = setInterval(wake, 60000);
    return () => clearInterval(keepAliveRef.current);
  }, [loaded, wallpaper.type]);

  /* ========================================================
     🧩 Cleanup blob URLs
     ======================================================== */
  useEffect(() => {
    return () => {
      if (wallpaper.source?.startsWith("blob:"))
        URL.revokeObjectURL(wallpaper.source);
    };
  }, [wallpaper.source]);

  /* ========================================================
     🎬 Video Compression
     ======================================================== */
  async function compressVideoFile(file, targetHeight = null, bitrateK = 2500) {
    const ffmpeg = await getFFmpeg();
    if (!ffmpeg) return file;
    setProcessing(true);
    try {
      const inName = "input.mp4";
      const outName = "output.mp4";
      ffmpeg.FS("writeFile", inName, await fetchFile(file));
      const args = ["-i", inName];
      if (targetHeight) args.push("-vf", `scale=-1:${targetHeight}`);
      args.push("-b:v", `${bitrateK}k`, "-preset", "veryfast", outName);
      await ffmpeg.run(...args);
      const data = ffmpeg.FS("readFile", outName);
      return new Blob([data.buffer], { type: "video/mp4" });
    } catch {
      return file;
    } finally {
      setProcessing(false);
    }
  }

  async function compressForScreen(file) {
    const screenH = window.screen?.height || 1080;
    const bitrateK = Math.min(5000, Math.max(1200, Math.floor((screenH / 1080) * 2500)));
    return await compressVideoFile(file, screenH, bitrateK);
  }

  /* ========================================================
     📹 Handle Video Upload
     ======================================================== */
  const handleVideoUpload = async (file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setWallpaper({ type: "video", source: previewUrl });
    setWallpaperType("video");

    try {
      const compressed = await compressForScreen(file);
      highResBlob.current = compressed;
      await saveVideoToDB(compressed);

      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setWallpaper({ type: "video", source: URL.createObjectURL(compressed) });

      // background compress low-res
      (async () => {
        lowResBlob.current = await compressVideoFile(compressed, 480, 700);
      })();
    } catch {
      highResBlob.current = file;
      await saveVideoToDB(file);
    }

    const save = { type: "video", source: "db" };
    if (chrome?.storage?.local) chrome.storage.local.set({ wallpaper: save });
    else localStorage.setItem("wallpaper", JSON.stringify(save));
  };

  /* ========================================================
     🖼️ Handle Image Upload
     ======================================================== */
  const handleImageUpload = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setWallpaper({ type: "image", source: dataUrl });
      setWallpaperType("image");
      await saveImageToDB(file);

      const save = { type: "image", source: "db" };
      if (chrome?.storage?.local) chrome.storage.local.set({ wallpaper: save });
      else localStorage.setItem("wallpaper", JSON.stringify(save));
    };
    reader.readAsDataURL(file);
  };

  /* ========================================================
     ♻️ Handle Reset
     ======================================================== */
  const handleReset = async () => {
    setWallpaper({ type: "default", source: null });
    highResBlob.current = lowResBlob.current = null;
    if (chrome?.storage?.local) chrome.storage.local.remove("wallpaper");
    else localStorage.removeItem("wallpaper");

    await deleteVideoFromDB();
    await deleteImageFromDB();
    setWallpaperType("default");
  };

  /* ========================================================
     🌍 Expose to window (safe)
     ======================================================== */
  useEffect(() => {
    window.handleImageUpload = handleImageUpload;
    window.handleVideoUpload = handleVideoUpload;
    window.handleReset = handleReset;
    return () => {
      delete window.handleImageUpload;
      delete window.handleVideoUpload;
      delete window.handleReset;
    };
  }, []);

  /* ========================================================
     🖼️ Render
     ======================================================== */
  if (!loaded)
    return <div className="fixed inset-0 bg-black animate-pulse" />;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {wallpaper.type === "default" && (
        <div className="absolute inset-0 bg-linear-to-br from-[#1a1a1a] via-[#0b0b0b] to-black opacity-80 blur-lg" />
      )}

      {wallpaper.type === "image" && wallpaper.source && (
        <img
          src={wallpaper.source}
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
          draggable={false}
        />
      )}

      {wallpaper.type === "video" && wallpaper.source && (
        <video
          ref={videoRef}
          src={wallpaper.source}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className="absolute inset-0 w-full h-full object-cover will-change-transform opacity-0 transition-opacity duration-300"
          onLoadedData={(e) => e.target.classList.replace("opacity-0", "opacity-100")}
        />
      )}

      {processing && (
        <div className="absolute bottom-4 right-4 text-sm text-gray-300 bg-black/50 px-2 py-1 rounded-md">
          Processing video...
        </div>
      )}
    </div>
  );
}
