import React from "react";
import Clock from "./components/Clock";
import Shortcuts from "./components/Shortcuts/Shortcuts";
import Wallpaper from "./components/Wallpaper";
import SearchBar from "./components/Searchbar";
import Header from "./components/Header";
import Weather from "./components/Weather";
import MiniMusicPlayer from "./components/MiniMusicPlayer";
import MiniCalendar from "./components/MiniCalendar";
import Settings from "./components/Settings";

import { ColorProvider } from "./context/ColorContext";
import { DashboardProvider, useDashboard } from "./context/DashboardContext";

import useScreenSize from "./hooks/useScreenSize";
import { responsiveConfig } from "./utils/responsiveConfig";
import { getResponsiveValue } from "./utils/getResponsiveValue";

import "./app.css";

function AppContent() {
  const { widgets } = useDashboard();
  const screen = useScreenSize();

  const scaleClass = getResponsiveValue(screen, responsiveConfig.scale);

  // posisi semua elemen
  const pos = Object.fromEntries(
    Object.entries(responsiveConfig.positions).map(([key, value]) => [
      key,
      getResponsiveValue(screen, value),
    ])
  );

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-start relative 
        ${screen.isSplitScreen ? "p-3 gap-3" : "p-6 gap-6"}`}
    >
      <Wallpaper />
      <Settings />

      {/* CLOCK CORNER */}
      {widgets.clockCorner && (
        <div
          className={`absolute ${pos.clockCorner} z-20 ${scaleClass} transition-transform duration-300 origin-top-right`}
        >
          <Clock position="corner" />
        </div>
      )}

      {/* WEATHER */}
      {widgets.weather && (
        <div
          className={`absolute ${pos.weather} z-20 ${scaleClass} transition-transform duration-300 origin-top-left`}
        >
          <Weather />
        </div>
      )}

      {/* CALENDAR */}
      {widgets.calendar && (
        <div
          className={`absolute ${pos.calendar} z-20 ${scaleClass} transition-transform duration-300 origin-bottom-right`}
        >
          <MiniCalendar />
        </div>
      )}

      {/* MINI MUSIC PLAYER */}
      {widgets.music && (
        <div
          className={`fixed ${pos.music} z-20 ${scaleClass} transition-transform duration-300 origin-bottom-left`}
        >
          <MiniMusicPlayer />
        </div>
      )}

      {/* HEADER */}
      {widgets.header && (
        <div
          className={`absolute ${pos.header} z-10 ${scaleClass} transition-transform duration-300 origin-top-center`}
        >
          <Header />
        </div>
      )}

      {/* INLINE CLOCK */}
      {widgets.clockInline && (
        <div
          className={`absolute ${pos.clockInline} z-10 ${scaleClass} transition-transform duration-300 origin-top-center`}
        >
          <Clock position="inline" />
        </div>
      )}

      {/* SEARCHBAR */}
      {widgets.search && (
        <div
          className={`absolute ${pos.searchbar} z-10 ${scaleClass} transition-transform duration-300 origin-top-center`}
        >
          <SearchBar />
        </div>
      )}

      {/* SHORTCUTS */}
      {widgets.shortcuts && (
        <div
          className={`absolute ${pos.shortcuts} z-10 ${scaleClass} transition-transform duration-300 origin-bottom-center`}
        >
          <Shortcuts />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ColorProvider>
      <DashboardProvider>
        <AppContent />
      </DashboardProvider>
    </ColorProvider>
  );
}
