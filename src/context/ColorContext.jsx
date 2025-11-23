import { createContext, useContext, useEffect, useState, useRef } from "react";

const ColorContext = createContext();

export function ColorProvider({ children }) {
  const [colors, setColors] = useState({
    usernameColor: "#ffffff",
    greetingColor: "#ffffff",
    roleColor: "#ffffff",
    categoryColor: "#ffffff",
    clockTimeColor: "#ffffff",
    clockTextColor: "#ffffff",
  });

  const [wallpaperType, setWallpaperType] = useState("image");
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimer = useRef(null); // 🕒 untuk debounce

  // 🔹 Load saved colors (satu kali)
  useEffect(() => {
    const loadData = async () => {
      if (process.env.NODE_ENV === "development") {
        const saved = localStorage.getItem("textColors");
        if (saved) setColors(JSON.parse(saved));

        const savedType = localStorage.getItem("wallpaperType");
        if (savedType) setWallpaperType(savedType);

        setIsLoaded(true);
        return;
      }

      // 🧩 Chrome Extension Mode
      chrome?.storage?.local?.get(["textColors", "wallpaperType"], (result) => {
        if (result.textColors) setColors(result.textColors);
        if (result.wallpaperType) setWallpaperType(result.wallpaperType);
        setIsLoaded(true);
      });
    };

    loadData();
  }, []);

  // 🔹 Debounced Save Colors
  useEffect(() => {
    if (!isLoaded) return;

    // Hapus timer sebelumnya
    if (saveTimer.current) clearTimeout(saveTimer.current);

    // Set timer baru untuk debounce (400 ms)
    saveTimer.current = setTimeout(() => {
      if (process.env.NODE_ENV === "development") {
        localStorage.setItem("textColors", JSON.stringify(colors));
        localStorage.setItem("wallpaperType", wallpaperType);
      } else {
        chrome?.storage?.local?.set({
          textColors: colors,
          wallpaperType,
        });
      }
    }, 100);

    // Cleanup (hapus timeout jika komponen unmount)
    return () => clearTimeout(saveTimer.current);
  }, [colors, wallpaperType, isLoaded]);

  if (!isLoaded) return null;

  return (
    <ColorContext.Provider
      value={{
        colors,
        setColors,
        wallpaperType,
        setWallpaperType,
      }}
    >
      {children}
    </ColorContext.Provider>
  );
}

export const useTextColor = () => useContext(ColorContext);
