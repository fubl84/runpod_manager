import * as pty from 'node-pty';
import { BrowserWindow } from 'electron';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

interface TerminalSession {
  pty: pty.IPty;
  id: string;
}

interface ShellConfig {
  shell: string;
  args: string[];
}

export class TerminalService {
  private sessions: Map<string, TerminalSession> = new Map();
  private mainWindow: BrowserWindow | null = null;

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  /**
   * Detects the best available shell for Windows
   */
  private detectWindowsShell(): ShellConfig {
    // Try PowerShell 7+ (cross-platform PowerShell)
    const pwshPaths = [
      'pwsh.exe', // In PATH
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'PowerShell', '7', 'pwsh.exe'),
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'PowerShell', '7-preview', 'pwsh.exe'),
    ];

    for (const pwshPath of pwshPaths) {
      try {
        if (pwshPath === 'pwsh.exe' || fs.existsSync(pwshPath)) {
          return {
            shell: pwshPath,
            args: ['-NoLogo', '-ExecutionPolicy', 'Bypass'],
          };
        }
      } catch (e) {
        // Continue to next option
      }
    }

    // Fall back to Windows PowerShell 5.1 (built into Windows)
    return {
      shell: 'powershell.exe',
      args: ['-NoLogo', '-ExecutionPolicy', 'Bypass'],
    };
  }

  /**
   * Detects the best available shell for Unix-like systems (macOS/Linux)
   */
  private detectUnixShell(): ShellConfig {
    // Use user's preferred shell from environment
    const shell = process.env.SHELL || '/bin/bash';

    // Use login shell to load full environment (Homebrew, NVM, etc.)
    return {
      shell,
      args: ['-l'],
    };
  }

  /**
   * Gets the optimal shell configuration for the current platform
   */
  private getShellConfig(): ShellConfig {
    const platform = os.platform();

    if (platform === 'win32') {
      return this.detectWindowsShell();
    } else {
      return this.detectUnixShell();
    }
  }

  /**
   * Builds environment variables with proper PATH for each platform
   */
  private buildEnvironment(): { [key: string]: string } {
    const env = { ...process.env } as { [key: string]: string };
    const platform = os.platform();

    if (platform === 'win32') {
      // Windows: Ensure common Windows paths are available
      const commonPaths = [
        path.join(process.env.SystemRoot || 'C:\\Windows', 'System32'),
        path.join(process.env.SystemRoot || 'C:\\Windows'),
        path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'Wbem'),
        path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0'),
      ];

      const existingPath = env.PATH || '';
      const pathsToAdd = commonPaths.filter(p => !existingPath.toLowerCase().includes(p.toLowerCase()));

      if (pathsToAdd.length > 0) {
        env.PATH = existingPath
          ? `${pathsToAdd.join(';')};${existingPath}`
          : pathsToAdd.join(';');
      }
    } else {
      // macOS/Linux: Add common Unix paths that might be missing in packaged apps
      const commonPaths = [
        '/usr/local/bin',
        '/usr/bin',
        '/bin',
        '/usr/sbin',
        '/sbin',
        '/opt/homebrew/bin', // Apple Silicon Homebrew
        '/opt/homebrew/sbin',
        '/usr/local/opt', // Intel Homebrew
      ];

      const existingPath = env.PATH || '';
      const pathsToAdd = commonPaths.filter(p => !existingPath.includes(p));

      if (pathsToAdd.length > 0) {
        env.PATH = existingPath
          ? `${pathsToAdd.join(':')}:${existingPath}`
          : pathsToAdd.join(':');
      }
    }

    return env;
  }

  /**
   * Gets the appropriate home directory for the current platform
   */
  private getHomeDirectory(): string {
    // os.homedir() works cross-platform
    return os.homedir();
  }

  createTerminal(id: string): void {
    if (this.sessions.has(id)) {
      console.warn(`Terminal ${id} already exists`);
      return;
    }

    // Get optimal shell configuration for the platform
    const shellConfig = this.getShellConfig();

    // Build environment with proper PATH for packaged apps
    const env = this.buildEnvironment();

    // Get cross-platform home directory
    const homeDir = this.getHomeDirectory();

    // Create PTY process
    const ptyProcess = pty.spawn(shellConfig.shell, shellConfig.args, {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: homeDir,
      env: env,
    });

    // Listen for data from PTY and send to renderer
    ptyProcess.onData((data: string) => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send(`terminal:data:${id}`, data);
      }
    });

    // Handle PTY exit
    ptyProcess.onExit(({ exitCode, signal }) => {
      console.log(`Terminal ${id} exited with code ${exitCode}, signal ${signal}`);
      this.sessions.delete(id);
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send(`terminal:exit:${id}`, { exitCode, signal });
      }
    });

    this.sessions.set(id, { pty: ptyProcess, id });
  }

  writeToTerminal(id: string, data: string): void {
    const session = this.sessions.get(id);
    if (session) {
      try {
        session.pty.write(data);
      } catch (error) {
        console.error(`Error writing to terminal ${id}:`, error);
      }
    } else {
      console.warn(`Terminal ${id} not found for write operation`);
    }
  }

  resizeTerminal(id: string, cols: number, rows: number): void {
    const session = this.sessions.get(id);
    if (session) {
      try {
        session.pty.resize(cols, rows);
      } catch (error) {
        console.error(`Error resizing terminal ${id}:`, error);
      }
    }
  }

  killTerminal(id: string): void {
    const session = this.sessions.get(id);
    if (session) {
      try {
        session.pty.kill();
        this.sessions.delete(id);
        console.log(`Killed terminal ${id}`);
      } catch (error) {
        console.error(`Error killing terminal ${id}:`, error);
        // Still remove it from sessions even if kill fails
        this.sessions.delete(id);
      }
    }
  }

  killAllTerminals(): void {
    this.sessions.forEach((session) => {
      session.pty.kill();
    });
    this.sessions.clear();
    console.log('Killed all terminals');
  }

  getTerminalCount(): number {
    return this.sessions.size;
  }
}