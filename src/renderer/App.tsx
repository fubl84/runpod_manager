import React, { useEffect } from 'react';
import { useAppStore } from './stores/app-store';
import { Sidebar } from './components/Sidebar';
import { PodsPage } from './pages/PodsPage';
import { LibraryPage } from './pages/LibraryPage';
import { TerminalPage } from './pages/TerminalPage';
import { SettingsPage } from './pages/SettingsPage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  const { currentView, setCurrentView, setLoading, setError, settings, setSettings, setPods, setCommands } = useAppStore();

  useEffect(() => {
    // Initialize app data
    const initializeApp = async () => {
      try {
        setLoading(true);
        // Load settings, pods, and commands
        const [loadedSettings, loadedPods, loadedCommands] = await Promise.all([
          window.electronAPI.getSettings(),
          window.electronAPI.getPods(),
          window.electronAPI.getCommands(),
        ]);
        setSettings(loadedSettings);
        setPods(loadedPods);
        setCommands(loadedCommands);
        console.log('App initialized');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setError('Failed to initialize application');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [setLoading, setError, setSettings, setPods, setCommands]);

  // Apply theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: '1',
      metaKey: true,
      description: 'Navigate to Pods',
      action: () => setCurrentView('pods'),
    },
    {
      key: '2',
      metaKey: true,
      description: 'Navigate to Library',
      action: () => setCurrentView('library'),
    },
    {
      key: '3',
      metaKey: true,
      description: 'Navigate to Terminal',
      action: () => setCurrentView('terminal'),
    },
    {
      key: ',',
      metaKey: true,
      description: 'Open Settings',
      action: () => setCurrentView('settings'),
    },
  ]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'pods':
        return <PodsPage />;
      case 'library':
        return <LibraryPage />;
      case 'terminal':
        return <TerminalPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <PodsPage />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* macOS Title Bar - Draggable */}
      <div
        className="h-14 bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        <div className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">
          RunPod Manager
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-white dark:bg-[#282828]">
          {currentView === 'terminal' ? (
            renderCurrentView()
          ) : (
            <div className="h-full overflow-y-auto">
              {renderCurrentView()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;