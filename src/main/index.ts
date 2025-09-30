import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { DatabaseService } from './database';
import { TerminalService } from './terminal-service';
import { setupIpcHandlers } from './ipc-handlers';

const isDev = process.env.NODE_ENV === 'development';
let database: DatabaseService;
let terminalService: TerminalService;

function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 16 },
    backgroundColor: '#FFFFFF',
    vibrancy: 'sidebar',
    icon: join(__dirname, '../../../build/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../../preload/index.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../../renderer/index.html'));
  }

  return mainWindow;
}

app.whenReady().then(() => {
  // Initialize database, terminal service, and IPC handlers
  database = new DatabaseService();
  terminalService = new TerminalService();

  const mainWindow = createMainWindow();
  terminalService.setMainWindow(mainWindow);

  setupIpcHandlers(database, terminalService);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const window = createMainWindow();
      terminalService.setMainWindow(window);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Clean up resources
  if (database) {
    database.close();
  }
  if (terminalService) {
    terminalService.killAllTerminals();
  }
});

if (isDev) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}