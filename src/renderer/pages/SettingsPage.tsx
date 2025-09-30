import React, { useState, useEffect } from 'react';
import { useAppStore } from '../stores/app-store';

export function SettingsPage() {
  const { settings, setSettings } = useAppStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load settings from electron-store on mount
    window.electronAPI.getSettings().then((loadedSettings) => {
      setSettings(loadedSettings);
      setLocalSettings(loadedSettings);
    });
  }, [setSettings]);

  const handleInputChange = (field: keyof typeof localSettings, value: any) => {
    setLocalSettings({ ...localSettings, [field]: value });
  };

  const handleBrowseSSHKey = async () => {
    const filePath = await window.electronAPI.selectFile();
    if (filePath) {
      setLocalSettings({ ...localSettings, sshKeyPath: filePath });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const updatedSettings = await window.electronAPI.updateSettings(localSettings);
      setSettings(updatedSettings);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving settings');
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      try {
        const defaultSettings = await window.electronAPI.resetSettings();
        setSettings(defaultSettings);
        setLocalSettings(defaultSettings);
        setSaveMessage('Settings reset to defaults');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (error) {
        setSaveMessage('Error resetting settings');
        console.error('Error resetting settings:', error);
      }
    }
  };

  const handleExportSettings = async () => {
    try {
      const settingsJson = await window.electronAPI.exportSettings();

      // Create a download link
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `runpod-manager-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSaveMessage('Settings exported successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error exporting settings');
      console.error('Error exporting settings:', error);
    }
  };

  const handleImportSettings = async () => {
    const filePath = await window.electronAPI.selectFile();
    if (!filePath) return;

    try {
      const settingsJson = await window.electronAPI.readFile(filePath);
      const importedSettings = await window.electronAPI.importSettings(settingsJson);
      setSettings(importedSettings);
      setLocalSettings(importedSettings);
      setSaveMessage('Settings imported successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error importing settings. Please check the file format.');
      console.error('Error importing settings:', error);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-[#282828] h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Settings</h2>

      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow dark:shadow-none border border-transparent dark:border-gray-700 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SSH Key Path
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={localSettings.sshKeyPath}
              placeholder="~/.ssh/id_ed25519"
              className="input-macos flex-1"
              readOnly
            />
            <button
              onClick={handleBrowseSSHKey}
              className="btn-secondary"
            >
              Browse
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Path to your SSH private key file
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Terminal Behavior
          </label>
          <select
            value={localSettings.defaultTerminalBehavior}
            onChange={(e) => handleInputChange('defaultTerminalBehavior', e.target.value as 'current' | 'new-tab')}
            className="select-macos"
          >
            <option value="current">Use current tab</option>
            <option value="new-tab">Open new tab</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme
          </label>
          <select
            value={localSettings.theme}
            onChange={(e) => handleInputChange('theme', e.target.value as 'light' | 'dark')}
            className="select-macos"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Terminal Font
          </label>
          <select
            value={localSettings.terminalFont}
            onChange={(e) => handleInputChange('terminalFont', e.target.value)}
            className="select-macos"
          >
            <option value="Monaco, monospace">Monaco</option>
            <option value="'SF Mono', monospace">SF Mono</option>
            <option value="'Fira Code', monospace">Fira Code</option>
            <option value="Consolas, monospace">Consolas</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Terminal Font Size
          </label>
          <input
            type="number"
            value={localSettings.terminalFontSize}
            onChange={(e) => handleInputChange('terminalFontSize', parseInt(e.target.value))}
            min="10"
            max="24"
            className="input-macos w-20"
          />
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">px</span>
        </div>

        <div className="pt-4 flex items-center space-x-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            onClick={handleReset}
            className="btn-secondary"
          >
            Reset to Defaults
          </button>
          {saveMessage && (
            <span className={`text-sm ${saveMessage.includes('Error') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {saveMessage}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-[#1E1E1E] rounded-lg shadow dark:shadow-none border border-transparent dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Data Management</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Backup & Restore</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Export your settings to a JSON file or import from a backup
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleExportSettings}
                className="btn-primary"
              >
                Export Settings
              </button>
              <button
                onClick={handleImportSettings}
                className="btn-primary"
              >
                Import Settings
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keyboard Shortcuts</h4>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Navigate to Pods</span>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">⌘ 1</span>
              </div>
              <div className="flex justify-between">
                <span>Navigate to Library</span>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">⌘ 2</span>
              </div>
              <div className="flex justify-between">
                <span>Navigate to Terminal</span>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">⌘ 3</span>
              </div>
              <div className="flex justify-between">
                <span>Open Settings</span>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">⌘ ,</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-[#1E1E1E] rounded-lg shadow dark:shadow-none border border-transparent dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">About</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div>Version: 1.0.0</div>
          <div>Author: Christoph Seiler</div>
          <div>Company: Flaming Battenberg</div>
          <div>Email: info@flamingbattenberg.de</div>
        </div>
      </div>
    </div>
  );
}