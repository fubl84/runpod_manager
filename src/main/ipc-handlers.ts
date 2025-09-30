import { ipcMain, dialog, BrowserWindow } from 'electron';
import { DatabaseService } from './database';
import { TerminalService } from './terminal-service';
import { settingsManager } from './settings-manager';

export function setupIpcHandlers(database: DatabaseService, terminalService: TerminalService) {
  // Pod operations
  ipcMain.handle('db:pods:getAll', async () => {
    return await database.getAllPods();
  });

  ipcMain.handle('db:pods:create', async (_, pod) => {
    return await database.createPod(pod);
  });

  ipcMain.handle('db:pods:update', async (_, id, updates) => {
    return await database.updatePod(id, updates);
  });

  ipcMain.handle('db:pods:delete', async (_, id) => {
    return await database.deletePod(id);
  });

  // Command operations
  ipcMain.handle('db:commands:getAll', async () => {
    return await database.getAllCommands();
  });

  ipcMain.handle('db:commands:create', async (_, command) => {
    return await database.createCommand(command);
  });

  ipcMain.handle('db:commands:update', async (_, id, updates) => {
    return await database.updateCommand(id, updates);
  });

  ipcMain.handle('db:commands:delete', async (_, id) => {
    return await database.deleteCommand(id);
  });

  // Settings operations
  ipcMain.handle('settings:get', () => {
    return settingsManager.getSettings();
  });

  ipcMain.handle('settings:update', (_, settings) => {
    return settingsManager.updateSettings(settings);
  });

  ipcMain.handle('settings:reset', () => {
    return settingsManager.resetSettings();
  });

  ipcMain.handle('settings:export', () => {
    return settingsManager.exportSettings();
  });

  ipcMain.handle('settings:import', (_, settingsJson) => {
    return settingsManager.importSettings(settingsJson);
  });

  // File/folder selection
  ipcMain.handle('file:select', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });

    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('file:read', async (_, filePath: string) => {
    const fs = require('fs').promises;
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  });

  ipcMain.handle('folder:select', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    return result.canceled ? null : result.filePaths[0];
  });

  // App window controls
  ipcMain.handle('app:close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.close();
  });

  ipcMain.handle('app:minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.minimize();
  });

  ipcMain.handle('app:maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window?.isMaximized()) {
      window.unmaximize();
    } else {
      window?.maximize();
    }
  });

  // Terminal operations
  ipcMain.handle('terminal:create', (_, id: string) => {
    try {
      terminalService.createTerminal(id);
      return Promise.resolve();
    } catch (error) {
      console.error('Error creating terminal:', error);
      return Promise.reject(error);
    }
  });

  ipcMain.handle('terminal:write', (_, id: string, data: string) => {
    try {
      terminalService.writeToTerminal(id, data);
      return Promise.resolve();
    } catch (error) {
      console.error('Error writing to terminal:', error);
      return Promise.reject(error);
    }
  });

  ipcMain.handle('terminal:resize', (_, id: string, cols: number, rows: number) => {
    try {
      terminalService.resizeTerminal(id, cols, rows);
      return Promise.resolve();
    } catch (error) {
      console.error('Error resizing terminal:', error);
      return Promise.reject(error);
    }
  });

  ipcMain.handle('terminal:kill', (_, id: string) => {
    try {
      terminalService.killTerminal(id);
      return Promise.resolve();
    } catch (error) {
      console.error('Error killing terminal:', error);
      return Promise.reject(error);
    }
  });
}