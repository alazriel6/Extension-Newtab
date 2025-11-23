import { createContext, useContext, useState, useEffect } from "react";

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const defaultWidgets = {
    clockCorner: true,
    header: true,
    weather: true,
    clockInline: true,
    search: true,
    shortcuts: true,
    music: false, // ✅ WAJIB ADA
    calendar: true,
  };

  const [widgets, setWidgets] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("dashboard_widgets"));

      if (saved) {
        // ✅ Gabungkan saved + default supaya key baru tidak hilang
        return { ...defaultWidgets, ...saved };
      }
    } catch {}

    return defaultWidgets;
  });

  // 🔥 SYNC widget state ke chrome.storage untuk background.js
  useEffect(() => {
    localStorage.setItem("dashboard_widgets", JSON.stringify(widgets));

    // ✅ Notify extension about music widget state
    if (typeof chrome !== "undefined" && chrome?.runtime?.sendMessage) {
      try {
        chrome.runtime.sendMessage(
          {
            type: "WIDGET_STATE_CHANGED",
            widget: "music",
            enabled: widgets.music,
          },
          () => {
            if (chrome.runtime.lastError) return;
          }
        );

        // Also store in chrome.storage for background.js to read on startup
        chrome.storage.local.set({ musicWidgetEnabled: widgets.music }, () => {
          if (chrome.runtime.lastError) return;
        });
      } catch {}
    }
  }, [widgets]);

  return (
    <DashboardContext.Provider value={{ widgets, setWidgets }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}