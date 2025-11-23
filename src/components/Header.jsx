import React, { useEffect, useState } from "react";
import { useTextColor } from "../context/ColorContext";
import Role from "./Role";

export default function Header() {
  const [username, setUsername] = useState("username");
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState("");

  const { colors } = useTextColor();

  const glowColor = "rgba(0,0,0,0.9)";
  const glowStyle = {
    color: colors.usernameColor,
    textShadow: `
      0 0 5px ${glowColor},
      0 2px 3px ${glowColor},
      0 4px 8px ${glowColor}
    `,
  };

  // ✅ Load username
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const savedName = localStorage.getItem("username");
      if (savedName) setUsername(savedName);

      window.addEventListener("storage", () => {
        const updatedName = localStorage.getItem("username");
        if (updatedName) setUsername(updatedName);
      });
      return;
    }

    if (!chrome?.storage?.local) return;
    chrome.storage.local.get(["username"], (result) => {
      if (result.username) setUsername(result.username);
    });
  }, []);

  // ✅ Save username
  const saveName = (newName) => {
    setUsername(newName);
    if (chrome?.storage?.local)
      chrome.storage.local.set({ username: newName });
    else localStorage.setItem("username", newName);
  };

  return (
    <header className="mt-15 text-center select-none">
      <div className="flex flex-col items-center justify-center">
        <div className="min-h-[1.2em] flex justify-center items-center">
          {editing ? (
            <input
              className="bg-transparent border-none text-8xl text-center outline-none w-full leading-none font-semibold"
              style={{
                ...glowStyle,
                height: "1em",
                lineHeight: "1em",
                padding: 0,
                margin: 0,
              }}
              autoFocus
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={() => {
                if (tempName.trim()) saveName(tempName.trim());
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tempName.trim()) {
                  saveName(tempName.trim());
                  setEditing(false);
                }
                if (e.key === "Escape") setEditing(false);
              }}
            />
          ) : (
            <h1
              className="text-8xl font-semibold cursor-pointer leading-none"
              style={{ ...glowStyle, height: "1em", lineHeight: "1em" }}
              onClick={() => {
                setTempName(username);
                setEditing(true);
              }}
            >
              {username}
            </h1>
          )}
        </div>

        <h2
          className="text-2xl font-semibold mt-2 font-quicksand uppercase"
          style={{
            color: colors.greetingColor,
            textShadow: `0 0 5px ${glowColor}, 0 2px 4px ${glowColor}`,
          }}
        >
          Nice to see you
        </h2>

        <Role />
      </div>
    </header>
  );
}
