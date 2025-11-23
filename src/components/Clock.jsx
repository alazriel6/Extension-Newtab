import React, { useEffect, useState } from "react";
import { useTextColor } from "../context/ColorContext";

export default function Clock({ position = "inline" }) {
  const [now, setNow] = useState(new Date());
  const { colors } = useTextColor();
  const glowColor = "rgba(0,0,0,0.9)";

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hours = now.getHours();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateString = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  let greeting = "";
  let icon = "";
  if (hours < 5) {
    greeting = "Good early morning";
    icon = "🌌";
  } else if (hours < 12) {
    greeting = "Good morning";
    icon = "☀️";
  } else if (hours < 18) {
    greeting = "Good afternoon";
    icon = "🌤️";
  } else if (hours < 22) {
    greeting = "Good evening";
    icon = "🌙";
  } else {
    greeting = "Good night";
    icon = "🌙";
  }

  if (position === "corner") {
    return (
      <div
        className="select-none font-digital-7"
        style={{
          color: colors.clockTimeColor,
          fontSize: "4rem",
          fontWeight: 700,
          textShadow: `
            0 0 2px ${glowColor},
            0 0 4px ${glowColor},
            0 4px 2px ${glowColor}
          `,
        }}
      >
        {timeString}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center select-none">
      <div className="flex flex-col items-center text-center p-3 md:p-5 uppercase">
        <div
          className="flex items-center gap-2 text-xl font-medium opacity-95 font-anurati"
          style={{
            color: colors.clockTextColor,
            textShadow: `
              0 0 5px ${glowColor},
              0 2px 4px ${glowColor},
              0 4px 8px ${glowColor}
            `,
          }}
        >
          <span>{icon}</span>
          <span>{greeting}</span>
        </div>

        <div
          className="mt-1 text-base md:text-lg opacity-85"
          style={{
            color: colors.clockTextColor,
            textShadow: `0 0 3px ${glowColor}, 0 1px 5px ${glowColor}`,
          }}
        >
          {dateString}
        </div>
      </div>
    </div>
  );
}
