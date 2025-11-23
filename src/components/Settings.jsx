import React, { useState, startTransition, memo } from "react";
import { useDashboard } from "../context/DashboardContext";
import { useTextColor } from "../context/ColorContext";
import useSettingsResponsive from "../hooks/useSettingsResponsive";
import RoleManager from "./RoleManager";
import Wallpaper from "./Wallpaper";

/* 🎨 Komponen ColorItem di-memo agar tidak rerender semua */
const ColorItem = memo(function ColorItem({ label, value, onChange }) {
  return (
    <div className="flex flex-col items-center bg-white/5 rounded-xl p-4 hover:bg-white/10 transition">
      <p className="mb-2 text-sm opacity-80">{label}</p>
      <input
        type="color"
        value={value}
        onInput={onChange}
        className="w-16 h-16 cursor-pointer rounded-lg shadow-inner"
      />
    </div>
  );
});

export default function Settings() {
  const { widgets, setWidgets } = useDashboard();
  const { colors, setColors } = useTextColor();
  const { button, modal, position } = useSettingsResponsive();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("dashboard"); // default panel

  const handleColorChange = (key, value) => {
    // Gunakan startTransition agar render tidak berat
    startTransition(() => {
      setColors((prev) => ({ ...prev, [key]: value }));
    });
  };

  return (
    <>
      {/* ✅ Tombol Settings */}
      <button
        className={`fixed ${position} bg-black/80 backdrop-blur-md ${button.padding} rounded-xl ${button.fontSize} hover:bg-black/30 transition z-50 text-white`}
        onClick={() => setOpen(true)}
      >
        Settings ⚙️
      </button>

      {/* ✅ Modal Settings */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className={`bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl ${modal.width} ${modal.height} flex relative text-white overflow-hidden transition-all duration-300`}>
            
            {/* Sidebar Tabs */}
            <div className={`w-1/4 ${modal.padding} border-r border-white/10 flex flex-col ${modal.gap}`}>
              {[
                ["dashboard", "Dashboard"],
                ["roles", "Roles"],
                ["text", "Text Colors"],
                ["wallpaper", "Wallpaper"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={`${modal.tabPadding} rounded-lg text-left transition ${
                    tab === key
                      ? "bg-white/25 font-semibold"
                      : "bg-white/5 hover:bg-white/10"
                  } ${modal.fontSize}`}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Konten Panel */}
            <div className={`w-3/4 ${modal.padding} flex flex-col overflow-hidden`}>
              <div className={`flex-1 overflow-y-auto pr-3 space-y-6 scroll-smooth ${modal.fontSize}`}>

                {/* 🧩 Dashboard Manager */}
                {tab === "dashboard" && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3 text-center">
                      Dashboard Manager
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(widgets).map((key) => (
                        <label
                          key={key}
                          className="flex justify-between items-center bg-white/5 p-3 rounded-xl hover:bg-white/10 transition"
                        >
                          <span>{key.replace(/([A-Z])/g, " $1")}</span>
                          <input
                            type="checkbox"
                            checked={widgets[key]}
                            onChange={() =>
                              setWidgets({ ...widgets, [key]: !widgets[key] })
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 🧩 Role Manager */}
                {tab === "roles" && <RoleManager embedded />}

                {/* 🎨 Text Color */}
                {tab === "text" && (
                  <div className="space-y-6 text-center">
                    <h2 className="text-xl font-semibold mb-10">
                      Text Colors
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        ["usernameColor", "Username"],
                        ["greetingColor", "Greeting"],
                        ["roleColor", "Role"],
                        ["categoryColor", "Category"],
                        ["clockTimeColor", "Clock Time"],
                        ["clockTextColor", "Greeting & Date"],
                      ].map(([key, label]) => (
                        <ColorItem
                          key={key}
                          label={label}
                          value={colors[key]}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setColors({
                          usernameColor: "#ffffff",
                          greetingColor: "#ffffff",
                          roleColor: "#ffffff",
                          categoryColor: "#ffffff",
                          clockTimeColor: "#ffffff",
                          clockTextColor: "#ffffff",
                        })
                      }
                      className="mt-4 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      Reset to Default
                    </button>
                  </div>
                )}

                {/* 🖼️ Wallpaper */}
                {tab === "wallpaper" && (
                  <div className="space-y-4 text-center">
                    <h2 className="text-xl font-semibold mb-3">Wallpaper</h2>

                    <label className="cursor-pointer bg-white/20 px-4 py-2 rounded-lg block hover:bg-white/30 transition">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          window.handleImageUpload(e.target.files[0])
                        }
                      />
                    </label>

                    <label className="cursor-pointer bg-white/20 px-4 py-2 rounded-lg block hover:bg-white/30 transition">
                      Upload Live Video
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) =>
                          window.handleVideoUpload(e.target.files[0])
                        }
                      />
                    </label>

                    <button
                      onClick={() => window.handleReset()}
                      className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Reset Wallpaper
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tombol Close */}
            <button
              className="absolute top-3 right-3 text-white text-xl hover:text-red-400 transition"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
