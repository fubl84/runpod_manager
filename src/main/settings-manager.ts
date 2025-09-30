import Store from 'electron-store';
import { AppSettings } from '../shared/types';

interface StoreSchema {
  settings: AppSettings;
}

const defaultSettings: AppSettings = {
  sshKeyPath: '',
  defaultTerminalBehavior: 'new-tab',
  theme: 'light',
  terminalFont: 'Monaco, monospace',
  terminalFontSize: 14,
};

class SettingsManager {
  private store: Store<StoreSchema>;

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'runpod-manager-settings',
      defaults: {
        settings: defaultSettings,
      },
    });
  }

  getSettings(): AppSettings {
    return this.store.get('settings', defaultSettings);
  }

  updateSettings(settings: Partial<AppSettings>): AppSettings {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    this.store.set('settings', updatedSettings);
    return updatedSettings;
  }

  resetSettings(): AppSettings {
    this.store.set('settings', defaultSettings);
    return defaultSettings;
  }

  exportSettings(): string {
    return JSON.stringify(this.getSettings(), null, 2);
  }

  importSettings(settingsJson: string): AppSettings {
    try {
      const importedSettings = JSON.parse(settingsJson) as AppSettings;
      // Validate that all required fields are present
      const validatedSettings: AppSettings = {
        sshKeyPath: importedSettings.sshKeyPath ?? defaultSettings.sshKeyPath,
        defaultTerminalBehavior: importedSettings.defaultTerminalBehavior ?? defaultSettings.defaultTerminalBehavior,
        theme: importedSettings.theme ?? defaultSettings.theme,
        terminalFont: importedSettings.terminalFont ?? defaultSettings.terminalFont,
        terminalFontSize: importedSettings.terminalFontSize ?? defaultSettings.terminalFontSize,
      };
      this.store.set('settings', validatedSettings);
      return validatedSettings;
    } catch (error) {
      throw new Error('Invalid settings format');
    }
  }
}

export const settingsManager = new SettingsManager();