import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "brave_dashboard_shortcuts_v2";

function loadShortcuts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function useShortcuts() {
  const [items, setItems] = useState(loadShortcuts);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const dragIdRef = useRef(null);
  const scrollRef = useRef(null);

  // Save to storage every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const makeIcon = (rawUrl) => {
    try {
      return "https://www.google.com/s2/favicons?sz=64&domain_url=" + new URL(rawUrl).hostname;
    } catch {
      return "";
    }
  };

  const openAdd = () => {
    setTitle("");
    setUrl("");
    setShowAdd(true);
  };

  const addShortcut = () => {
    if (!title.trim() || !url.trim()) return;

    // 🔥 Batasi maksimal 14 item
    if (items.length >= 14) return;

    setItems((prev) => [
      { id: Date.now(), title: title.trim(), url: url.trim(), icon: makeIcon(url) },
      ...prev
    ]);
    setTitle("");
    setUrl("");
    setShowAdd(false);
  };

  const deleteShortcut = (id) => setItems((s) => s.filter((i) => i.id !== id));

  const openEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setUrl(item.url);
    setShowEdit(true);
  };

  const saveEdit = () => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === editingId ? { ...i, title, url, icon: makeIcon(url) } : i
      )
    );
    setShowEdit(false);
  };

  const onDragOver = (e) => e.preventDefault();

  const onDragStart = (e, id) => {
    dragIdRef.current = id;
    e.dataTransfer.setData("text/plain", id);
  };

  const onDrop = (e, overId) => {
    const fromId = dragIdRef.current;
    if (!fromId || fromId === overId) return;

    setItems((prev) => {
      const list = [...prev];
      const from = list.findIndex((i) => i.id === fromId);
      const to = list.findIndex((i) => i.id === overId);
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      return list;
    });
  };

  return {
    items,
    showAdd,
    showEdit,
    title,
    url,
    scrollRef,

    setTitle,
    setUrl,
    setShowAdd,
    setShowEdit,

    openAdd,
    addShortcut,
    deleteShortcut,
    openEdit,
    saveEdit,

    onDragStart,
    onDragOver,
    onDrop,
    editingId
  };
}
