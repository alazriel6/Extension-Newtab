import { useState, useEffect } from "react";

/**
 * Hook untuk mendeteksi ukuran layar & kategori responsif
 * Sekarang mendukung kategori tambahan: laptop, 2K, 4K, 8K
 */
export default function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
    isXs: false,
    isSm: false,
    isMd: false,
    isLg: false,
    isLaptop: false,
    isXl: false,
    isXxl: false,
    is2k: false,
    is4k: false,
    is8k: false,
    isSplitScreen: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 🔧 Tes manual resolusi tinggi (ubah di console: localStorage.setItem("forceResolution", "4k"))
      const forcedMode =
        localStorage.getItem("forceResolution") || "auto";

      let simulatedWidth = width;
      if (forcedMode === "2k") simulatedWidth = 2560;
      if (forcedMode === "4k") simulatedWidth = 3840;
      if (forcedMode === "8k") simulatedWidth = 7680;

      setScreenSize({
        width: simulatedWidth,
        height,
        isXs: simulatedWidth <= 480,
        isSm: simulatedWidth > 480 && simulatedWidth <= 768,
        isMd: simulatedWidth > 768 && simulatedWidth <= 1024,
        isLg: simulatedWidth > 1024 && simulatedWidth <= 1280,
        isLaptop: simulatedWidth > 1280 && simulatedWidth <= 1440,
        isXl: simulatedWidth > 1440 && simulatedWidth <= 1920,
        isXxl: simulatedWidth > 1920 && simulatedWidth < 2560,   // ✅ ubah jadi < 2560
        is2k: simulatedWidth >= 2560 && simulatedWidth < 3840,   // ✅ mulai dari 2560px
        is4k: simulatedWidth >= 3840 && simulatedWidth < 5120,
        is8k: simulatedWidth >= 5120,
        isSplitScreen: simulatedWidth <= 1280,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenSize;
}
