import * as pty from 'node-pty';
import { BrowserWindow } from 'electron';
import * as os from 'os';

interface TerminalSession {
  pty: pty.IPty;
  id: string;
}

export class TerminalService {
  private sessions: Map<string, TerminalSession> = new Map();
  private mainWindow: BrowserWindow | null = null;

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  createTerminal(id: string): void {
    if (this.sessions.has(id)) {
      console.warn(`Terminal ${id} already exists`);
      return;
    }

    // Determine shell based on platform
    const shell = os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || 'zsh';

    // Create PTY process
    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME || process.cwd(),
      env: process.env as { [key: string]: string },
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
    console.log(`Created terminal ${id} with shell ${shell}`);
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