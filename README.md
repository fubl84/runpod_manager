# RunPod Manager

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey.svg)
![Electron](https://img.shields.io/badge/electron-38.2.0-blue.svg)
![React](https://img.shields.io/badge/react-19.1.1-blue.svg)

A modern, native desktop application for managing RunPod connections with an integrated terminal, built with Electron, React, and TypeScript. Streamline your RunPod workflow with persistent pod profiles, command templates, SSH connections, tunneling, and file transfers—all in one beautiful, native macOS-style interface.

## ✨ Features

### 🚀 **Pod Management**
- Create and manage multiple RunPod profiles with persistent configuration
- Store IP addresses, ports, SSH URLs, and local tunnel ports
- Quick-switch between pods without manually updating commands
- Search, filter, and organize pod profiles

### 📚 **Command Library**
- Build a library of reusable command templates
- Variable substitution for dynamic commands (`<ip>`, `<port>`, `<sshUrl>`, etc.)
- Assign commands to specific pods or keep them global
- Categorize commands for easy organization
- One-click command execution

### 💻 **Integrated Terminal**
- Full-featured terminal emulator powered by xterm.js and node-pty
- Multi-tab terminal support
- Quick-access toolbar for common operations:
  - SSH connections
  - Port tunneling
  - File uploads and downloads
  - Command library execution
- Configurable terminal behavior (new tab vs. current tab)
- Toggle switch for quick workflow adjustment

### ⚙️ **Settings & Customization**
- SSH key path configuration
- Theme switching (Light/Dark mode)
- Terminal font and size customization
- Keyboard shortcuts (⌘1, ⌘2, ⌘3, ⌘,)
- Settings import/export for backup and sharing
- Native macOS design language

### 🎨 **Native Design**
- Beautiful, native macOS interface
- Full dark mode support throughout the app
- Draggable title bar with traffic light controls
- Native-style buttons, inputs, and controls
- Consistent 28px control height
- SF Pro Text system font

## 📸 Screenshots

> Add your screenshots here from the `/screenshots` directory

## 🛠️ Tech Stack

### Core Technologies
- **[Electron](https://www.electronjs.org/)** (v38.2.0) - Cross-platform desktop framework
- **[React](https://react.dev/)** (v19.1.1) - UI framework
- **[TypeScript](https://www.typescriptlang.org/)** (v5.9.2) - Type-safe development
- **[Vite](https://vitejs.dev/)** (v4.5.14) - Fast build tool

### Terminal & System
- **[xterm.js](https://xtermjs.org/)** (v5.5.0) - Terminal emulator
- **[node-pty](https://github.com/microsoft/node-pty)** (v1.0.0) - PTY bindings for Node.js

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** (v4.1.13) - Utility-first CSS framework
- **[Zustand](https://github.com/pmndrs/zustand)** (v5.0.8) - State management

### Data & Storage
- **[SQLite3](https://www.sqlite.org/)** (v5.1.7) - Database for pods and commands
- **[electron-store](https://github.com/sindresorhus/electron-store)** (v8.2.0) - Settings persistence

## 📋 Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **macOS** 10.13+ (for macOS builds) or **Windows 10+** or **Linux**

## 🚀 Installation

### Clone the Repository
```bash
git clone https://github.com/fubl84/runpod_manager.git
cd runpod_manager
```

### Install Dependencies
```bash
npm install
```

### Post-Install (Automatic)
The `postinstall` script will automatically run `electron-builder install-app-deps` to ensure native modules are properly compiled.

## 💻 Development

### Start Development Server
```bash
npm run dev
```

This command starts:
- Vite dev server for the renderer process (React UI)
- Electron app with hot reload

The app will open automatically with the development console.

### Development Scripts
```bash
# Build renderer (React frontend)
npm run build:renderer

# Build main process (Electron main)
npm run build:main

# Build preload script
npm run build:preload

# Build everything
npm run build

# Preview production build
npm run preview
```

## 📦 Building for Production

### Build Application
```bash
npm run build:app
```

This will:
1. Build all TypeScript and React code
2. Package the Electron app with electron-builder
3. Create distributable files in the `release/` directory

### Platform-Specific Builds

**macOS:**
- Outputs: `.dmg` installer
- Supports: Intel (x64) and Apple Silicon (arm64)
- Icon: Includes custom macOS iconset with dark mode variants

**Windows & Linux:**
- Configured in `package.json` (extend `build` section as needed)

## 📁 Project Structure

```
RunPod_Manager/
├── src/
│   ├── main/                      # Electron main process
│   │   ├── index.ts              # Main entry point
│   │   ├── database.ts           # SQLite database setup
│   │   ├── ipc-handlers.ts       # IPC communication handlers
│   │   └── settings-manager.ts   # Settings persistence
│   ├── renderer/                  # React frontend
│   │   ├── components/           # Reusable UI components
│   │   │   ├── CommandCard.tsx
│   │   │   ├── CommandForm.tsx
│   │   │   ├── CommandSelector.tsx
│   │   │   ├── FileTransferDialog.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── PodCard.tsx
│   │   │   ├── PodForm.tsx
│   │   │   ├── PodSelector.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Terminal.tsx
│   │   │   ├── TerminalTabs.tsx
│   │   │   └── Toggle.tsx
│   │   ├── pages/                # Main page components
│   │   │   ├── LibraryPage.tsx
│   │   │   ├── PodsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── TerminalPage.tsx
│   │   ├── stores/               # Zustand state stores
│   │   │   └── app-store.ts
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── useKeyboardShortcuts.ts
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # React entry point
│   │   └── index.css             # Global styles
│   ├── shared/                    # Shared types and utilities
│   │   ├── types.ts              # TypeScript interfaces
│   │   └── command-templates.ts  # Command template service
│   └── preload/                   # Preload scripts
│       └── index.ts              # IPC bridge
├── build/                         # Build resources
│   ├── icon.icns                 # macOS app icon
│   └── icon.png                  # Icon source
├── dist/                          # Compiled output (gitignored)
├── release/                       # Packaged apps (gitignored)
├── package.json                   # Project dependencies
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                # Vite config
└── tailwind.config.js            # Tailwind config
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ 1` | Navigate to Pods |
| `⌘ 2` | Navigate to Library |
| `⌘ 3` | Navigate to Terminal |
| `⌘ ,` | Open Settings |

## 🗄️ Data Storage

### SQLite Database
- **Location**: User data directory (managed by Electron)
- **Tables**:
  - `pods` - Pod profile configurations
  - `commands` - Command library entries

### Settings Storage
- **Format**: JSON (via electron-store)
- **Location**: OS-specific config directory
  - macOS: `~/Library/Application Support/RunPod Manager/`
  - Windows: `%APPDATA%/RunPod Manager/`
  - Linux: `~/.config/RunPod Manager/`

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style (TypeScript, React functional components)
- Ensure dark mode compatibility for all UI changes
- Use native macOS design patterns (28px button height, system fonts)
- Test on both light and dark modes
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Christoph Seiler**
[Flaming Battenberg](mailto:info@flamingbattenberg.de)

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/) - Cross-platform desktop framework
- [xterm.js](https://xtermjs.org/) - Terminal emulator
- [React](https://react.dev/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - State management
- The RunPod community for inspiration

## 🐛 Issues & Support

Found a bug or have a feature request? Please [open an issue](https://github.com/fubl84/runpod_manager/issues) on GitHub.

## 📊 Project Status

Current Version: **1.0.0**
Status: **Active Development** ✅

### Completed Features ✅
- ✅ Pod management (CRUD operations)
- ✅ Command library with variable substitution
- ✅ Integrated terminal with multi-tab support
- ✅ SSH connections and port tunneling
- ✅ File upload/download
- ✅ Settings and configuration
- ✅ Native macOS design
- ✅ Full dark mode support
- ✅ Keyboard shortcuts

### Roadmap 🚀
- [ ] Command execution history
- [ ] Pod health monitoring
- [ ] Batch operations
- [ ] Cloud sync for settings
- [ ] Plugin system
- [ ] Windows/Linux UI optimization

---

**Made with ❤️ for the RunPod community**