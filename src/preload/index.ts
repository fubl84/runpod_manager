import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  closeApp: () => ipcRenderer.invoke('app:close'),
  minimizeApp: () => ipcRenderer.invoke('app:minimize'),
  maximizeApp: () => ipcRenderer.invoke('app:maximize'),

  // Terminal operations
  createTerminal: (id: string) => ipcRenderer.invoke('terminal:create', id),
  writeToTerminal: (id: string, data: string) => ipcRenderer.invoke('terminal:write', id, data),
  resizeTerminal: (id: string, cols: number, rows: number) => ipcRenderer.invoke('terminal:resize', id, cols, rows),
  killTerminal: (id: string) => ipcRenderer.invoke('terminal:kill', id),

  // Terminal event listeners
  onTerminalData: (id: string, callback: (data: string) => void) => {
    const channel = `terminal:data:${id}`;
    ipcRenderer.on(channel, (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners(channel);
  },

  // Database operations
  getPods: () => ipcRenderer.invoke('db:pods:getAll'),
  createPod: (pod: any) => ipcRenderer.invoke('db:pods:create', pod),
  updatePod: (id: string, pod: any) => ipcRenderer.invoke('db:pods:update', id, pod),
  deletePod: (id: string) => ipcRenderer.invoke('db:pods:delete', id),

  getCommands: () => ipcRenderer.invoke('db:commands:getAll'),
  createCommand: (command: any) => ipcRenderer.invoke('db:commands:create', command),
  updateCommand: (id: string, command: any) => ipcRenderer.invoke('db:commands:update', id, command),
  deleteCommand: (id: string) => ipcRenderer.invoke('db:commands:delete', id),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: any) => ipcRenderer.invoke('settings:update', settings),
  resetSettings: () => ipcRenderer.invoke('settings:reset'),
  exportSettings: () => ipcRenderer.invoke('settings:export'),
  importSettings: (settingsJson: string) => ipcRenderer.invoke('settings:import', settingsJson),

  // File operations
  selectFile: () => ipcRenderer.invoke('file:select'),
  selectFolder: () => ipcRenderer.invoke('folder:select'),
  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
});

// Type definitions for the exposed API
export interface ElectronAPI {
  closeApp: () => Promise<void>;
  minimizeApp: () => Promise<void>;
  maximizeApp: () => Promise<void>;

  createTerminal: (id: string) => Promise<void>;
  writeToTerminal: (id: string, data: string) => Promise<void>;
  resizeTerminal: (id: string, cols: number, rows: number) => Promise<void>;
  killTerminal: (id: string) => Promise<void>;
  onTerminalData: (id: string, callback: (data: string) => void) => () => void;

  getPods: () => Promise<any[]>;
  createPod: (pod: any) => Promise<any>;
  updatePod: (id: string, pod: any) => Promise<any>;
  deletePod: (id: string) => Promise<void>;

  getCommands: () => Promise<any[]>;
  createCommand: (command: any) => Promise<any>;
  updateCommand: (id: string, command: any) => Promise<any>;
  deleteCommand: (id: string) => Promise<void>;

  getSettings: () => Promise<any>;
  updateSettings: (settings: any) => Promise<any>;
  resetSettings: () => Promise<any>;
  exportSettings: () => Promise<string>;
  importSettings: (settingsJson: string) => Promise<any>;

  selectFile: () => Promise<string | null>;
  selectFolder: () => Promise<string | null>;
  readFile: (filePath: string) => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}