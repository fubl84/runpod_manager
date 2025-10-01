# Cross-Platform Build Guide

RunPod Manager now supports **macOS**, **Windows**, and **Linux** with platform-optimized configurations.

## Platform Support

### macOS ✅
- **Architectures**: Intel (x64), Apple Silicon (arm64)
- **Format**: DMG installer
- **Features**: Native titlebar, traffic lights, vibrancy effects
- **Shell**: User's preferred shell (zsh, bash, etc.) with login profile

### Windows ✅
- **Architectures**: x64, arm64
- **Formats**:
  - NSIS installer (customizable install directory)
  - Portable executable
- **Features**: Standard Windows window styling
- **Shell**: PowerShell 7+ (if available) → PowerShell 5.1 fallback
- **Shell Args**: `-NoLogo -ExecutionPolicy Bypass` for proper profile loading

### Linux ✅
- **Architectures**: x64, arm64
- **Formats**: AppImage, .deb (Debian/Ubuntu), .rpm (Fedora/RHEL)
- **Features**: Standard Linux window styling
- **Shell**: User's preferred shell with login profile
- **Category**: Development tools

## Building for Different Platforms

### Build Commands

```bash
# Build for current platform only
npm run build:app

# Build for specific platform
npm run build:mac      # macOS only
npm run build:win      # Windows only
npm run build:linux    # Linux only

# Build for all platforms (requires appropriate OS/tools)
npm run build:all
```

### Build Requirements

#### macOS Builds
- Can build for: macOS, Windows, Linux
- Tools: electron-builder (included)

#### Windows Builds
- Can build for: Windows, Linux
- Tools: electron-builder (included)
- Note: Cannot build macOS DMG from Windows

#### Linux Builds
- Can build for: Linux, Windows
- Tools: electron-builder (included)
- Note: Cannot build macOS DMG from Linux

## Platform-Specific Implementations

### Terminal Service
The terminal service intelligently detects and configures the optimal shell for each platform:

**Windows**:
- Searches for PowerShell 7+ (`pwsh.exe`)
- Falls back to PowerShell 5.1 (`powershell.exe`)
- Uses proper execution policy for profile loading

**macOS/Linux**:
- Uses `$SHELL` environment variable (user's preferred shell)
- Falls back to `/bin/bash`
- Loads login shell for full environment (Homebrew, NVM, etc.)

### Window Configuration
**macOS**: Hidden titlebar with traffic lights, vibrancy effect
**Windows/Linux**: Standard OS-native window chrome

### Environment & PATH
- **Windows**: Uses `;` as PATH separator, includes System32, PowerShell paths
- **Unix**: Uses `:` as PATH separator, includes Homebrew, standard Unix paths

### Home Directory
Uses `os.homedir()` which works correctly across all platforms:
- macOS/Linux: `/Users/username` or `/home/username`
- Windows: `C:\Users\username`

## File Structure

```
build/
  ├── icon.icns         # macOS icon
  ├── icon.ico          # Windows icon
  ├── icon.png          # Linux icon (also fallback)
  ├── icon-light.png
  └── icon-dark.png

release/                # Build output directory
  ├── mac/              # macOS builds
  ├── win-unpacked/     # Windows builds
  └── linux-unpacked/   # Linux builds
```

## Testing

### Development Mode
```bash
npm run dev
```
Runs on current platform with hot reload.

### Platform-Specific Testing
- **macOS**: Test directly on macOS hardware
- **Windows**: Test on Windows hardware or VM (Parallels, VMware, VirtualBox)
- **Linux**: Test on Linux hardware, VM, or WSL2 (with X server)

## SSH Compatibility

The app uses standard SSH, which is available on:
- **macOS**: Built-in OpenSSH client
- **Linux**: Built-in OpenSSH client
- **Windows 10+**: Built-in OpenSSH client (since Win10 1809)

Older Windows systems may require manual OpenSSH installation or Git Bash.

## Troubleshooting

### Windows: "Scripts are disabled"
If PowerShell script execution fails, the app automatically uses `-ExecutionPolicy Bypass` to load profiles safely.

### macOS: "App is damaged"
```bash
xattr -cr /Applications/RunPod\ Manager.app
```

### Linux: AppImage won't run
```bash
chmod +x RunPod-Manager-*.AppImage
```

## Contributing

When adding platform-specific code:
1. Use runtime platform detection: `os.platform()` or `process.platform`
2. Keep platform-specific code isolated in dedicated methods
3. Always provide fallbacks for each platform
4. Test on target platforms before committing

## Version History

- **v1.2.0**: Added Windows and Linux support with platform-optimized configurations
- **v1.1.0**: macOS-only release
