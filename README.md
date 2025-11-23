# 🎨 New Tab Dashboard Extension

> A fully customizable personal dashboard New Tab extension for Brave/Chrome browsers, built with modern web technologies.

![React](https://img.shields.io/badge/react-19-blue?logo=react)
![Vite](https://img.shields.io/badge/vite-7-purple?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-4-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/license-Open%20Source-green)

## 🌟 Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 👋 **Personal Greeting** | Username & role dengan animasi ketik yang smooth |
| 🕐 **Real-time Clock** | Digital clock dengan greeting otomatis & timezone detection |
| 🌤️ **Weather Widget** | Live weather data + dynamic background berdasarkan cuaca |
| 🎵 **Music Player** | Spotify & YouTube Music detection + audio visualizer |
| 🔗 **Custom Shortcuts** | Hingga 14 shortcuts + drag & drop sorting |
| 📅 **Mini Calendar** | Event management, weekly repeats & history tracking |
| 🔍 **Smart Search** | Google/Bing/DuckDuckGo + AI search integration |
| 🖼️ **Wallpaper Manager** | Color/image/video dengan auto-compression via FFmpeg |
| 🎨 **Dark Theme UI** | Modern dark interface + color picker untuk setiap elemen |
| 📋 **Role Manager** | Multiple role categories dengan display bergantian |

---

## 🛠️ Tech Stack

```
Frontend        → React 19 + Vite 7 + Tailwind CSS 4
Styling         → Framer Motion (animasi)
Storage         → Chrome Storage API, IndexedDB, LocalStorage
Processing      → FFmpeg.wasm (video compression)
UI Components   → Lucide-react (icons)
Media Detection → tabCapture API, React-YouTube
Weather API     → MET Norway Weather API (met.no)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- Brave atau Chrome browser

### Setup

```bash
# 1. Clone repository
git clone https://github.com/alazriel6/Extension-Newtab.git
cd Extension-Newtab

# 2. Install dependencies
npm install

# 3. Development mode
npm run dev
# Akses: http://localhost:5173

# 4. Build untuk production
npm run build
```

### Load Extension ke Browser

1. Buka `chrome://extensions/` atau `brave://extensions/`
2. Aktifkan **Developer Mode** (toggle di kanan atas)
3. Klik **Load unpacked**
4. Pilih folder `build/`

---

## 📖 Usage Guide

### 🎨 Personalisasi
- Edit nama & role Anda
- Customize tema warna untuk setiap elemen
- Tambah kategori role baru

### 🔗 Shortcuts
- Tambah/hapus shortcut dengan mudah
- Drag & drop untuk sorting
- Hapus dengan icon ×

### 🌤️ Weather
- Input kota manual atau enable geolocation otomatis
- Real-time weather updates

### 🎵 Musik
- Auto-detect YouTube Music & Spotify
- Audio visualizer built-in
- Tab capture API integration

### 🖼️ Wallpaper
- Pilih solid color, image, atau video background
- Auto-compression untuk optimal performance

---

## 📐 Responsive Breakpoints

| Breakpoint | Width | Device |
|-----------|-------|--------|
| `xs` | ≤480px | Mobile |
| `sm` | ≤768px | Tablet |
| `md` | ≤1024px | Small Laptop |
| `lg` | ≤1280px | Laptop |
| `laptop` | ≤1440px | 1440p Display |
| `xl` | ≤1920px | 1080p Display |
| `xxl` | ≤2560px | 1440p Display |
| `2k` | ≥2560px | 2K Monitor |
| `4k` | ≥3840px | 4K Monitor |
| `8k` | ≥5120px | 8K Monitor |

---

## 🗂️ Available Scripts

```bash
npm run dev          # Development server dengan hot-reload
npm run build        # Production build
npm run preview      # Preview production build locally
npm run lint         # Run ESLint checks
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Ekstensi tidak muncul | Reload extension, verifikasi folder `build/`, clear browser cache |
| Weather error | Izinkan geolocation atau input kota manual |
| Musik tidak terdeteksi | Pastikan tabCapture aktif, refresh YouTube Music/Spotify |
| Performance issues | Clear IndexedDB, disable heavy animations di settings |

---

## 🤝 Contributing

Kontribusi sangat diterima! Berikut caranya:

```bash
git checkout -b feature/fitur-baru
git commit -m "feat: tambah fitur baru"
git push origin feature/fitur-baru
```

Buat Pull Request di [repository GitHub](https://github.com/alazriel6/Extension-Newtab).

---

## 📜 License

Open-source — bebas digunakan dan dimodifikasi.

## 🎉 Credits

Dibangun dengan:
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [FFmpeg.wasm](https://ffmpegwasm.netlify.app)
- [MET Weather API](https://www.met.no)

---

<div align="center">

Made with ❤️ by [alazriel6](https://github.com/alazriel6)

[⭐ Give a star if you like this project!](https://github.com/alazriel6/Extension-Newtab)

</div>
