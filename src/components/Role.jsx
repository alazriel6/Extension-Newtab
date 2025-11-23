import React, { useEffect, useState } from "react";
import { useTextColor } from "../context/ColorContext";

export default function Role() {
  const [roles, setRoles] = useState([]);
  const [roleMap, setRoleMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  const { colors } = useTextColor();
  const glowColor = "rgba(0,0,0,0.85)";

  const currentRole = roles[currentIndex];
  const currentCategory = roleMap[currentRole];

  useEffect(() => {
    let saved;
    if (process.env.NODE_ENV === "development") {
      saved = JSON.parse(localStorage.getItem("categories") || "[]");
      load(saved);
    } else {
      chrome.storage.local.get(["categories"], (result) => {
        load(result.categories || []);
      });
    }
  }, []);

  const load = (categories) => {
    const enabled = categories.filter((c) => c.enabled);
    let list = [];
    let map = {};
    enabled.forEach((cat) => {
      cat.roles.forEach((r) => {
        if (r.trim()) {
          list.push(r);
          map[r] = cat.name;
        }
      });
    });
    setRoles(list);
    setRoleMap(map);
  };

  // Typewriter effect
  useEffect(() => {
    if (roles.length === 0) return;
    let speed = isDeleting ? 40 : 70;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentRole.length) {
          setDisplayText(currentRole.slice(0, charIndex + 1));
          setCharIndex((i) => i + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 1200);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentRole.slice(0, charIndex - 1));
          setCharIndex((i) => i - 1);
        } else {
          const next = (currentIndex + 1) % roles.length;
          setCurrentIndex(next);
          setIsDeleting(false);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, currentRole, roles.length]);

  return (
    <div className="text-center mt-4 select-none">
      {currentCategory && (
        <div className="mb-1 animate-fade">
          <span
            className="text-sm uppercase tracking-[0.32em] font-semibold"
            style={{
              color: colors.categoryColor,
              textShadow: `0 0 4px ${glowColor}, 0 2px 6px ${glowColor}`,
            }}
          >
            {currentCategory}
          </span>
        </div>
      )}

      <h2
        className="text-3xl font-semibold"
        style={{
          color: colors.roleColor,
          textShadow: `0 0 4px ${glowColor}, 0 2px 6px ${glowColor}`,
        }}
      >
        {displayText}
        <span className="opacity-80">_</span>
      </h2>
    </div>
  );
}
