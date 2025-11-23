import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CalendarDays,
  ChevronDown,
  Clock4,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * MiniCalendar component (Responsive - cleaned up)
 * Behavior unchanged from original version — only layout / responsive classes and small tidy-ups applied.
 */
export default function MiniCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [agenda, setAgenda] = useState({});
  const [history, setHistory] = useState({});
  const [input, setInput] = useState("");
  const [time, setTime] = useState("");
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [showAgenda, setShowAgenda] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [animDir, setAnimDir] = useState(0);
  const [, setTick] = useState(0); // used to re-render every minute
  const audioRef = useRef(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // load saved data
  useEffect(() => {
    const ag = localStorage.getItem("mini_calendar_agenda_v5");
    const hi = localStorage.getItem("mini_calendar_history_v2");
    if (ag) setAgenda(JSON.parse(ag));
    if (hi) setHistory(JSON.parse(hi));
    audioRef.current = new Audio("/bingbong.mp3"); // put bingbong.mp3 in public/
    // Request notification permission early
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const saveAgenda = (d) => {
    setAgenda(d);
    localStorage.setItem("mini_calendar_agenda_v5", JSON.stringify(d));
  };
  const saveHistory = (d) => {
    setHistory(d);
    localStorage.setItem("mini_calendar_history_v2", JSON.stringify(d));
  };

  const key = selectedDate.toDateString();
  const agendaForDate = agenda[key] || [];

  // minute tick to refresh countdowns
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(i);
  }, []);

  // helper: parse dateKey + time string (time "HH:MM")
  const parseEventDateTime = (dateKey, timeStr) => {
    const base = new Date(dateKey);
    if (!timeStr) return base;
    const [hh, mm] = timeStr.split(":").map((n) => parseInt(n, 10));
    base.setHours(isNaN(hh) ? 0 : hh, isNaN(mm) ? 0 : mm, 0, 0);
    return base;
  };

  // helper: check duplicate (same text,time,date,repeat)
  const isDuplicateEvent = (dateKey, text, timeStr, repeatFlag) => {
    const list = agenda[dateKey] || [];
    return list.some(e =>
      e.text === text.trim() &&
      e.time === timeStr &&
      !!e.repeatWeekly === !!repeatFlag
    );
  };

  // add event
  const addAgenda = () => {
    if (!input.trim() || !time) return;
    if (isDuplicateEvent(key, input, time, repeatWeekly)) {
      // don't add duplicates
      setInput("");
      return;
    }
    const newEvent = {
      id: Date.now() + Math.floor(Math.random() * 999),
      text: input.trim(),
      time,
      date: key,
      done: false,
      notified: false,
      repeatWeekly: !!repeatWeekly
    };

    const newData = {
      ...agenda,
      [key]: [...(agenda[key] || []), newEvent],
    };
    saveAgenda(newData);
    setInput("");
    setRepeatWeekly(false);
  };

  // remove single event (from active)
  const removeAgenda = (id) => {
    const updated = (agenda[key] || []).filter(e => e.id !== id);
    saveAgenda({ ...agenda, [key]: updated });
  };

  // clear history for all days or for a specific date (optional)
  const clearHistoryAll = () => {
    saveHistory({});
  };

  // periodic checker: notifications + move to history + repeatWeekly rollover
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const newAgenda = JSON.parse(JSON.stringify(agenda)); // deep copy
      const newHistory = JSON.parse(JSON.stringify(history));
      let changed = false;

      Object.keys(newAgenda).forEach(dateKey => {
        const list = newAgenda[dateKey] || [];
        list.forEach((e) => {
          const eventTime = parseEventDateTime(dateKey, e.time);
          const diff = eventTime - now;

          // 1) One-hour-before reminder
          if (diff > 0 && diff <= 3600000 && !e.notifiedOneHour) {
            try { audioRef.current?.play(); } catch {}
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("⏰ Reminder (1 hour)", { body: `${e.text} • ${e.time}` });
            }
            e.notifiedOneHour = true;
            changed = true;
          }

          // 2) At event time reminder (within 60s window)
          if (Math.abs(diff) <= 60000 && !e.notifiedAtTime) {
            try { audioRef.current?.play(); } catch {}
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("⏰ Event now", { body: `${e.text} • ${e.time}` });
            }
            e.notifiedAtTime = true;
            changed = true;
          }

          // 3) If event passed long enough (e.g., > 1 minute past), move to history
          if (eventTime.getTime() + 60000 < now.getTime() && !e.done) {
            e.done = true;
            if (!newHistory[dateKey]) newHistory[dateKey] = [];
            if (!newHistory[dateKey].some(h => h.id === e.id)) {
              newHistory[dateKey].push({ ...e });
            }

            // repeat weekly: create next-week event
            if (e.repeatWeekly) {
              const baseDate = new Date(dateKey);
              baseDate.setDate(baseDate.getDate() + 7);
              const nextKey = baseDate.toDateString();
              const nextEvent = {
                ...e,
                id: Date.now() + Math.floor(Math.random() * 9999),
                date: nextKey,
                done: false,
                notifiedOneHour: false,
                notifiedAtTime: false,
              };
              newAgenda[nextKey] = newAgenda[nextKey] || [];
              const exists = newAgenda[nextKey].some(ev => ev.text === nextEvent.text && ev.time === nextEvent.time && !!ev.repeatWeekly === !!nextEvent.repeatWeekly);
              if (!exists) {
                newAgenda[nextKey].push(nextEvent);
              }
            }
            changed = true;
          }
        });

        // remove done events from active list
        newAgenda[dateKey] = (newAgenda[dateKey] || []).filter(ev => !ev.done);
        if (newAgenda[dateKey].length === 0) delete newAgenda[dateKey];
      });

      if (changed) {
        saveAgenda(newAgenda);
        saveHistory(newHistory);
      }
    };

    check();
    const id = setInterval(check, 30000); // run every 30s
    return () => clearInterval(id);
  }, [agenda, history]); // re-run effect when agenda/history changes

  // countdown helper
  const getCountdown = (dateStr, t) => {
    const target = parseEventDateTime(dateStr, t);
    const now = new Date();
    const diffMs = target - now;
    if (diffMs <= 0) return "Done";
    const min = Math.floor(diffMs / 60000);
    const hr = Math.floor(min / 60);
    if (hr > 0) return `${hr}h ${min % 60}m`;
    return `${min}m`;
  };

  // build calendar cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= lastDate; d++) cells.push(d);

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
      position: "absolute"
    }),
    center: {
      x: 0,
      opacity: 1,
      position: "static",
      transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
    },
    exit: (dir) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
      position: "absolute",
      transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
    })
  };

  // Clear history for a specific date (optional helper)
  const clearHistoryFor = (dateKey) => {
    const newH = { ...history };
    delete newH[dateKey];
    saveHistory(newH);
  };

  return (
    <div className="p-4 rounded-2xl bg-[#1b1c20]/70 text-white w-full max-w-xs sm:max-w-sm md:w-80 backdrop-blur-xl shadow-lg flex flex-col gap-3 mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => { setAnimDir(-1); setCurrentDate(new Date(year, month - 1, 1)); }}
          className="p-1 rounded hover:bg-white/6"
        >
          <ChevronLeft size={18}/>
        </button>

        <h2 className="font-semibold text-sm sm:text-base">{monthNames[month]} {year}</h2>

        <button
          onClick={() => { setAnimDir(1); setCurrentDate(new Date(year, month + 1, 1)); }}
          className="p-1 rounded hover:bg-white/6"
        >
          <ChevronRight size={18}/>
        </button>
      </div>

      {/* Today Button */}
      <button
        onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}
        className="text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 w-fit mx-auto"
      >
        Today
      </button>

      {/* Days header */}
      <div className="grid grid-cols-7 text-[10px] sm:text-xs opacity-70 mb-1">
        {days.map((d) => <div key={d} className="text-center">{d}</div>)}
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden relative">
        <AnimatePresence initial={false} custom={animDir}>
          <motion.div
            key={month + "-" + year}
            custom={animDir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-7 text-[11px] sm:text-sm gap-y-1 sm:gap-y-2 auto-rows-[26px] sm:auto-rows-[32px]"
          >
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const thisDate = new Date(year, month, day);
              const isToday = isSameDay(thisDate, new Date());
              const isSelected = isSameDay(thisDate, selectedDate);
              const dayKey = thisDate.toDateString();
              const has = (agenda[dayKey] || []).some(ev => !ev.done);

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(thisDate)}
                  className={`flex items-center justify-center rounded-lg cursor-pointer transition-colors select-none px-1 py-0.5
                    ${isSelected ? "bg-white text-black font-bold" : isToday ? "border border-white/40" : "hover:bg-white/10"}
                    ${has ? "relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-[#00ff40]" : ""}`}
                >
                  {day}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Selected Date Info + toggles */}
      <div className="flex justify-between items-center text-[12px] sm:text-sm">
        <div className="flex items-center gap-2 text-[12px] sm:text-sm"><CalendarDays size={14}/> {selectedDate.toLocaleDateString()}</div>
        <div className="flex gap-2">
          <button onClick={() => setShowHistory(h => !h)} className="p-1 rounded hover:bg-white/6"><History size={16}/></button>
          <button onClick={() => setShowAgenda(a => !a)} className="p-1 rounded hover:bg-white/6"><ChevronDown size={16}/></button>
        </div>
      </div>

      {/* Agenda panel */}
      <AnimatePresence>
        {showAgenda && (
          <motion.div initial={{height:0, opacity:0}} animate={{height:"auto", opacity:1}} exit={{height:0, opacity:0}}>
            <div className="bg-white/10 rounded-lg p-2 text-sm mt-1">
              {/* Inputs: time, text, repeat toggle */}
              <div className="flex gap-2 mb-2 text-[12px] sm:text-sm">
                <input
                  type="time"
                  value={time}
                  onChange={(e)=>setTime(e.target.value)}
                  className="w-16 sm:w-20 bg-transparent border-b border-white/30 text-white text-[11px] sm:text-xs outline-none"
                />
                <input
                  type="text"
                  value={input}
                  onChange={(e)=>setInput(e.target.value)}
                  placeholder="Add event..."
                  className="flex-1 bg-transparent border-b border-white/30 text-white text-[11px] sm:text-xs outline-none"
                />
              </div>

              {/* Repeat + Add */}
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-1 text-xs opacity-80">
                  <input
                    type="checkbox"
                    className="accent-white"
                    checked={repeatWeekly}
                    onChange={(e)=>setRepeatWeekly(e.target.checked)}
                  />
                  <span className="text-[12px] sm:text-sm">Repeat weekly</span>
                </label>

                <button
                  onClick={addAgenda}
                  title="Add"
                  className="p-1 bg-white/15 hover:bg-white/25 rounded-md transition"
                >
                  <Plus size={14}/>
                </button>
              </div>

              {/* Events list */}
              <div className="max-h-28 overflow-y-auto space-y-1">
                {agendaForDate.length === 0 && <p className="text-white/60 text-xs">No events.</p>}
                {agendaForDate.map(e => (
                  <div key={e.id} className="flex justify-between items-center bg-white/10 px-2 py-1 rounded-md">
                    <div>
                      <div className="font-medium text-xs sm:text-sm">{e.text}</div>
                      <div className="text-white/50 text-[10px] flex items-center gap-1">
                        <Clock4 size={10}/> {e.time} • {getCountdown(key, e.time)} {e.repeatWeekly ? " • weekly" : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={()=>removeAgenda(e.id)} title="Delete" className="p-1 rounded hover:bg-white/6"><Trash2 size={12}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{height:0, opacity:0}} animate={{height:"auto", opacity:1}} exit={{height:0, opacity:0}}>
            <div className="bg-white/10 rounded-lg p-2 text-sm mt-1 max-h-36 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs opacity-80">History</div>
                <div className="flex items-center gap-2">
                  <button onClick={clearHistoryAll} className="text-xs px-2 py-0.5 rounded bg-white/6 hover:bg-white/10">Clear all</button>
                </div>
              </div>

              {Object.keys(history).length === 0 && <p className="text-white/60 text-xs">No history yet.</p>}

              {Object.keys(history).sort((a,b)=> new Date(b) - new Date(a)).map(dateKey => (
                <div key={dateKey} className="mb-2">
                  <div className="text-[11px] opacity-70 mb-1 flex justify-between items-center">
                    <span>{dateKey}</span>
                    <button onClick={()=>clearHistoryFor(dateKey)} className="text-[11px] opacity-70 hover:text-white">Clear</button>
                  </div>
                  {(history[dateKey] || []).map(h => (
                    <div key={h.id} className="bg-white/8 px-2 py-1 text-xs rounded-md mb-1">
                      <div className="flex justify-between"><div>{h.text}</div><div className="opacity-70 text-[11px]">{h.time}{h.repeatWeekly ? " • weekly" : ""}</div></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
