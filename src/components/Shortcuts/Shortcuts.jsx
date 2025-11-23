import { createPortal } from "react-dom";
import { useEffect } from "react";
import { useShortcuts } from "./useShortcuts";

/* ------------------------------------------------
   Modal Wrapper + ESC Close Support
------------------------------------------------ */
function ModalWrapper({ children, onClose }) {
  useEffect(() => {
    function key(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative p-6 w-96 rounded-xl bg-zinc-950 border border-white/10">
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ------------------------------------------------
   MAIN COMPONENT
------------------------------------------------ */
export default function Shortcuts() {
  const s = useShortcuts();

  const smoothScroll = (px) => {
    const el = s.scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: el.scrollLeft + px, behavior: "smooth" });
  };

  return (
    <div className="relative w-full space-y-6">

      {/* Scrollable Container */}
      <div
        ref={s.scrollRef}
        className="grid grid-flow-col grid-rows-2 auto-cols-max items-center justify-center gap-3 
        overflow-x-auto overflow-y-hidden no-scrollbar px-3 sm:px-4 md:px-6 py-2"
      >

        {/* Add Shortcut Button */}
        <button
          onClick={s.openAdd}
          disabled={s.items.length >= 13}
          className="flex-none w-15 h-15 sm:w-20 sm:h-20 flex flex-col items-center justify-center 
          rounded-xl bg-linear-to-b from-sky-500 to-indigo-600 text-white shadow-md 
          border border-white/10 hover:scale-110 transform transition-all cursor-pointer disabled:opacity-40 disabled:hover:scale-100"
        >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center text-2xl font-bold">
          <span className="-translate-y-0.5 inline-block">+</span>
        </div>
          <p className="text-[10px] mt-0.5">Add</p>
        </button>

        {/* Items */}
        {s.items.map((item) => (
          <a
            key={item.id}
            href={item.url}
            rel="noopener noreferrer"
            draggable
            onDragStart={(e) => {
              s.onDragStart(e, item.id);
              e.currentTarget.classList.add("scale-125", "opacity-80");
            }}
            onDragEnd={(e) => {
              e.currentTarget.classList.remove("scale-125", "opacity-80");
            }}
            onDragOver={s.onDragOver}
            onDrop={(e) => s.onDrop(e, item.id)}
            className="flex-none w-15 h-15 sm:w-20 sm:h-20 relative group p-2 sm:p-4 rounded-xl
            bg-white/5 backdrop-blur-md border border-white/10
            hover:border-blue-600 hover:ring-blue-500 hover:bg-blue-600/10
            transition-all hover:scale-110 shadow cursor-grab select-none"
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="w-10 h-10 rounded-full bg-black/30 border border-white/10 -mt-1.5
                flex items-center justify-center shadow-sm group-hover:shadow-[0_0_12px_rgba(50,90,140,0.45)] group-hover:scale-110 transition-all"
                title={item.title}
              >
                {item.icon ? (
                  <img src={item.icon} className="w-7 h-7 rounded-full" alt="icon" />
                ) : (
                  <span className="text-xs sm:text-sm font-medium text-white/80">
                    {(item.title || "").slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-white font-medium text-[10px] truncate w-full">
                {item.title}
              </p>
            </div>

            {/* Edit/Delete Buttons */}
            <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  s.deleteShortcut(item.id);
                }}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-red-600/70 hover:bg-red-600 text-white text-xs"
              >
                ×
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  s.openEdit(item);
                }}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xs"
              >
                ✎
              </button>
            </div>
          </a>
        ))}
      </div>

      {/* Add Modal */}
      {s.showAdd && (
        <ModalWrapper onClose={() => s.setShowAdd(false)}>
          <h2 className="text-lg font-semibold text-white mb-4">Add Shortcut</h2>

          {s.url && (
            <img
              src={`https://www.google.com/s2/favicons?domain=${s.url}&sz=64`}
              className="w-6 h-6 mb-3 opacity-70"
            />
          )}

          <input
            className="w-full p-3 mb-3 rounded-lg bg-black/30 border border-white/10 text-white"
            placeholder="Shortcut Name"
            value={s.title}
            onChange={(e) => s.setTitle(e.target.value)}
            autoFocus
          />

          <input
            className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white"
            placeholder="https://website.com"
            value={s.url}
            onChange={(e) => s.setUrl(e.target.value)}
          />

          <div className="flex justify-end mt-6 gap-3">
            <button
              onClick={() => s.setShowAdd(false)}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={s.addShortcut}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_12px_rgba(99,102,241,0.45)]"
            >
              Add
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Edit Modal */}
      {s.showEdit && (
        <ModalWrapper onClose={() => s.setShowEdit(false)}>
          <h2 className="text-lg font-semibold text-white mb-4">Edit Shortcut</h2>

          <input
            className="w-full p-3 mb-3 rounded-lg bg-black/30 border border-white/10 text-white"
            value={s.title}
            onChange={(e) => s.setTitle(e.target.value)}
          />
          <input
            className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white"
            value={s.url}
            onChange={(e) => s.setUrl(e.target.value)}
          />

          <div className="flex justify-between mt-5 gap-3">
            <button
              onClick={() => {
                s.deleteShortcut(s.editingId);
                s.setShowEdit(false);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Delete
            </button>
            <button
              onClick={s.saveEdit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}
