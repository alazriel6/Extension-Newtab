// db.js — Optimized & cleaner IndexedDB utility

let dbInstance = null;
const DB_NAME = "WALLPAPER_DB";
const DB_VERSION = 2;
const STORES = ["videoStore", "imageStore"];

/* ===========================
   🗄️ OPEN / INIT DATABASE
   =========================== */
export function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      // Create missing object stores dynamically
      STORES.forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store);
        }
      });
    };

    req.onsuccess = () => {
      dbInstance = req.result;

      dbInstance.onversionchange = () => {
        console.warn("⚠️ Database version changed — closing connection.");
        dbInstance.close();
        dbInstance = null;
      };

      resolve(dbInstance);
    };

    req.onerror = () => reject(req.error);
    req.onblocked = () => {
      console.warn("⚠️ IndexedDB open blocked — close other tabs or reload.");
    };
  });
}

/* ===========================
   🧩 GENERIC STORE HANDLERS
   =========================== */
async function withStore(storeName, mode, action) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    const request = action(store);

    // Handle success/error consistently
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => {
      console.error(`❌ ${action.name || "transaction"} error:`, request.error);
      reject(request.error);
    };

    tx.oncomplete = () => {
      // Optional: could resolve here if no request result is needed
    };
  });
}

/* ===========================
   🎬 VIDEO FUNCTIONS
   =========================== */
export const saveVideoToDB = (file) =>
  withStore("videoStore", "readwrite", (store) => store.put(file, "video"));

export const loadVideoFromDB = () =>
  withStore("videoStore", "readonly", (store) => store.get("video"));

export const deleteVideoFromDB = () =>
  withStore("videoStore", "readwrite", (store) => store.delete("video"));

/* ===========================
   🖼️ IMAGE FUNCTIONS
   =========================== */
export const saveImageToDB = (file) =>
  withStore("imageStore", "readwrite", (store) => store.put(file, "image"));

export const loadImageFromDB = () =>
  withStore("imageStore", "readonly", (store) => store.get("image"));

export const deleteImageFromDB = () =>
  withStore("imageStore", "readwrite", (store) => store.delete("image"));

/* ===========================
   🧹 CLEANUP / RESET
   =========================== */
export async function clearAllData() {
  const db = await openDB();
  return Promise.all(
    STORES.map(
      (store) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(store, "readwrite");
          tx.objectStore(store).clear();
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
        })
    )
  );
}
