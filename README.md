# 🎨 New Tab Dashboard

A beautiful, customizable new tab replacement for Brave/Chrome browsers built with **React + Vite + Tailwind CSS**. Transform your new tab experience with dynamic weather, music controls, shortcuts, calendar, and much more.

---

## ✨ Features

### 🎯 Core Features
- **Personalized Dashboard** - Greet with your custom username and dynamic role typing effect
- **Real-time Clock** - Digital clock with date and time display with greeting messages
- **Weather Widget** - Live weather data with beautiful sky backgrounds and weather icons
- **Music Player** - Mini music player with Spotify & YouTube Music integration
- **Quick Shortcuts** - Customizable bookmarks with drag-and-drop reordering (up to 14 shortcuts)
- **Mini Calendar** - Calendar with agenda planning and event history tracking
- **Search Bar** - Integrated search with Google/Bing/DuckDuckGo support and AI integration
- **Wallpaper Management** - Upload custom images or videos as background with video compression
- **Dark Theme** - Modern dark UI with customizable text colors for each element

### 🎨 Customization
- **Color Picker** - Customize colors for username, greeting, role, category, clock, and more
- **Widget Toggle** - Show/hide any widget to customize your dashboard layout
- **Responsive Design** - Supports all screen resolutions from mobile to 8K displays
- **Role Management** - Create and manage multiple roles and categories with typing animation
- **Wallpaper Options** - Default solid color, custom images, or video backgrounds

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Brave or Chrome browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alazriel6/Extension-Newtab.git
   cd Extension-Newtab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load into Brave/Chrome**
   - Open `brave://extensions/` or `chrome://extensions/`
   - Enable **Developer Mode** (top right)
   - Click **Load unpacked**
   - Select the `build/` folder
   - Your new tab should now use this dashboard!

### Development Mode

Run the dev server with hot reload:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser (for testing the UI separately).

---

## 📁 Project Structure

```
brave-ekstension/
├── src/
│   ├── components/
│   │   ├── Clock.jsx              # Time & greeting display
│   │   ├── Header.jsx             # Username with edit mode
│   │   ├── Role.jsx               # Typewriter role animation
│   │   ├── Searchbar.jsx          # Multi-engine search
│   │   ├── Settings.jsx           # Color & widget settings
│   │   ├── Wallpaper.jsx          # Wallpaper management
│   │   ├── MiniCalendar.jsx       # Calendar with agenda
│   │   ├── MiniMusicPlayer.jsx    # Music player widget
│   │   ├── RoleManager.jsx        # Role/category management
│   │   ├── Weather/
│   │   │   ├── Weather.jsx        # Main weather component
│   │   │   ├── WeatherUI.jsx      # Weather UI & controls
│   │   │   ├── WeatherIcon.jsx    # Weather icon display
│   │   │   ├── WeatherSky.jsx     # Dynamic sky background
│   │   │   └── WeatherGlow.jsx    # Weather glow effect
│   │   └── Shortcuts/
│   │       ├── Shortcuts.jsx      # Shortcuts grid & modals
│   │       └── useShortcuts.js    # Shortcuts logic hook
│   ├── context/
│   │   ├── ColorContext.jsx       # Global color state
│   │   └── DashboardContext.jsx   # Widget toggles state
│   ├── hooks/
│   │   ├── useScreenSize.js       # Responsive breakpoints
│   │   ├── useWeather.js          # Weather API hook
│   │   └── useSettingsResponsive.js # Settings responsive
│   ├── utils/
│   │   ├── responsiveConfig.js    # Position & size config
│   │   └── getResponsiveValue.js  # Responsive value resolver
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # React DOM entry
│   └── index.css                  # Global styles & animations
├── scripts/
│   ├── background.js              # Service worker for music sync
│   ├── content.js                 # YouTube music detector
│   └── content_spotify.js         # Spotify music detector
├── public/
│   ├── manifest.json              # Extension manifest
│   ├── fonts/                     # Custom fonts
│   ├── icons/                     # Extension icons
│   └── weather-icon/              # Weather icons
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS config
├── package.json                   # Dependencies
└── index.html                     # HTML template
```

---

## 🎮 Usage

### 1. **Personalization**
- Click on your **username** to edit it
- Go to **Settings** (⚙️) to:
  - Customize text colors for each element
  - Toggle widgets on/off
  - Manage roles and categories

### 2. **Add Shortcuts**
- Click the **+** button in shortcuts section
- Enter title and URL
- Drag to reorder (up to 14 shortcuts max)
- Click the icon to visit, × to delete

### 3. **Set Weather Location**
- Enter city name in the weather widget
- Click **Save** to remember location
- Weather updates automatically every 30 minutes

### 4. **Manage Roles**
- Open Settings → Role Manager
- Create categories and add roles
- Enable/disable categories to show/hide roles
- Roles cycle with typewriter animation

### 5. **Calendar & Agenda**
- Click on any date to add events
- Set time and optional weekly repeat
- View upcoming agenda or event history
- Events are saved per day

### 6. **Music Player**
- Automatically detects YouTube Music and Spotify
- Shows current playing track
- Controls: play, pause, next, previous
- Displays visualizer rings based on audio level

### 7. **Set Wallpaper**
- Open Settings → Wallpaper
- Choose: Color, Image, or Video
- Videos are auto-compressed for performance
- Defaults to gradient if not set

---

## ⚙️ Configuration

### Responsive Breakpoints

The dashboard adapts to all screen sizes:

| Breakpoint | Width | Device |
|-----------|-------|--------|
| xs | ≤480px | Mobile |
| sm | ≤768px | Tablet |
| md | ≤1024px | Small Laptop |
| lg | ≤1280px | Laptop |
| laptop | ≤1440px | 1440p |
| xl | ≤1920px | 1080p |
| xxl | <2560px | 1440p |
| 2k | ≥2560px | 2K Resolution |
| 4k | ≥3840px | 4K Resolution |
| 8k | ≥5120px | 8K Resolution |

### Custom Fonts

Available fonts:
- **Anurati** - Greeting text
- **Quicksand** - Secondary text
- **Digital-7** - Clock numbers

---

## 🔧 Development

### Build Commands

```bash
# Development server with HMR
npm run dev

# Production build
npm run build

# Build with analysis
npm run build:analyze

# Preview build output
npm preview

# Run ESLint
npm run lint
```

### Key Technologies

- **React 19** - UI framework
- **Vite 7** - Build tool & dev server
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **FFmpeg.wasm** - Video compression
- **Met.no API** - Weather data

### Storage

Data is persisted using:
- **Chrome Storage API** - For extension mode
- **LocalStorage** - For development mode
- **IndexedDB** - For wallpaper videos/images

---

## 📦 Dependencies

### Production
- `react` & `react-dom` - UI framework
- `@tailwindcss/vite` - Tailwind integration
- `framer-motion` - Animation library
- `@ffmpeg/ffmpeg` - Video processing
- `lucide-react` - Icon components
- `react-youtube` - YouTube integration
- `jszip` - ZIP file handling

### Development
- `vite` - Build tool
- `@vitejs/plugin-react` - React plugin for Vite
- `eslint` - Code linting
- `tailwindcss` - CSS framework

---

## 🐛 Troubleshooting

### Extension not loading?
1. Check `manifest.json` is in `build/` folder after build
2. Verify all `content_*.js` and `background.js` are in `build/`
3. Try clearing cache and reloading extension

### Weather not showing?
1. Allow location permissions when prompted
2. Or manually enter city name in weather widget
3. Check internet connection (uses Met.no API)

### Music player not detecting songs?
1. Verify extension has permissions for YouTube/Spotify
2. Ensure music widget is enabled in Settings
3. Refresh music pages after enabling widget

### Wallpaper video lagging?
1. Try smaller/shorter video files
2. Adjust bitrate in `Wallpaper.jsx` (default: 2500 kbps)
3. Use image wallpaper instead for better performance

### Colors not persisting?
1. Check Chrome Storage API permissions in manifest.json
2. Ensure extension has access to `storage` permission
3. Try clearing extension data and restarting

---

## 🌐 API Endpoints

- **Weather:** [Met.no Forecast API](https://www.met.no/en/about-us/about-met-no/weather-api)
  - Free, no API key required
  - Auto-refreshes every 30 minutes

- **Search Suggestions:** Google/Bing/DuckDuckGo APIs
  - Integrated search with auto-suggestions

---

## 📝 Manifest Permissions

```json
{
  "permissions": ["tabs", "storage", "activeTab", "tabCapture", "scripting"],
  "host_permissions": [
    "*://www.youtube.com/*",
    "*://open.spotify.com/*"
  ]
}
```

- **tabs** - Access tab information
- **storage** - Save user data
- **activeTab** - Detect active tab
- **tabCapture** - Capture audio for visualizer
- **scripting** - Inject content scripts
- **YouTube/Spotify hosts** - Access music data

---

## 🎯 Future Enhancements

- [ ] Theme presets (dark, light, custom)
- [ ] Sync settings across devices
- [ ] More music streaming platforms (Apple Music, YouTube Music)
- [ ] Customizable widget positions
- [ ] Export/import dashboard settings
- [ ] Multi-language support
- [ ] Keyboard shortcuts
- [ ] Focus mode with timer

---

## 📄 License

This project is open source. Feel free to fork, modify, and distribute.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📧 Support

Found an issue? Have a suggestion?
- Open an issue on [GitHub](https://github.com/alazriel6/Extension-Newtab/issues)
- Check existing issues before creating a new one

---

## 🎉 Credits

Built with ❤️ by the community. Special thanks to:
- [Vite](https://vitejs.dev) - Lightning fast build tool
- [React](https://react.dev) - Declarative UI library
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion) - Motion library
- [Met.no](https://www.met.no) - Weather API

---

**Happy Dashboard Building! 🚀**
