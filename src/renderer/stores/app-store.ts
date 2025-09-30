import { create } from 'zustand';
import { PodProfile, Command, AppSettings } from '../../shared/types';

type NavigationView = 'pods' | 'library' | 'terminal' | 'settings';

interface AppState {
  // Navigation
  currentView: NavigationView;
  setCurrentView: (view: NavigationView) => void;

  // Pods
  pods: PodProfile[];
  selectedPod: PodProfile | null;
  setPods: (pods: PodProfile[]) => void;
  setSelectedPod: (pod: PodProfile | null) => void;
  addPod: (pod: PodProfile) => void;
  updatePod: (id: string, updates: Partial<PodProfile>) => void;
  removePod: (id: string) => void;

  // Commands
  commands: Command[];
  setCommands: (commands: Command[]) => void;
  addCommand: (command: Command) => void;
  updateCommand: (id: string, updates: Partial<Command>) => void;
  removeCommand: (id: string) => void;

  // Settings
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;

  // UI State
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentView: 'pods',
  setCurrentView: (view) => set({ currentView: view }),

  // Pods
  pods: [],
  selectedPod: null,
  setPods: (pods) => set({ pods }),
  setSelectedPod: (pod) => set({ selectedPod: pod }),
  addPod: (pod) => set((state) => ({ pods: [pod, ...state.pods] })),
  updatePod: (id, updates) =>
    set((state) => ({
      pods: state.pods.map((pod) =>
        pod.id === id ? { ...pod, ...updates, updatedAt: new Date() } : pod
      ),
      selectedPod:
        state.selectedPod?.id === id
          ? { ...state.selectedPod, ...updates, updatedAt: new Date() }
          : state.selectedPod,
    })),
  removePod: (id) =>
    set((state) => ({
      pods: state.pods.filter((pod) => pod.id !== id),
      selectedPod: state.selectedPod?.id === id ? null : state.selectedPod,
    })),

  // Commands
  commands: [],
  setCommands: (commands) => set({ commands }),
  addCommand: (command) => set((state) => ({ commands: [command, ...state.commands] })),
  updateCommand: (id, updates) =>
    set((state) => ({
      commands: state.commands.map((cmd) =>
        cmd.id === id ? { ...cmd, ...updates, updatedAt: new Date() } : cmd
      ),
    })),
  removeCommand: (id) =>
    set((state) => ({
      commands: state.commands.filter((cmd) => cmd.id !== id),
    })),

  // Settings
  settings: {
    sshKeyPath: '',
    defaultTerminalBehavior: 'new-tab',
    theme: 'light',
    terminalFont: 'Monaco, monospace',
    terminalFontSize: 14,
  },
  setSettings: (settings) => set({ settings }),

  // UI State
  loading: false,
  setLoading: (loading) => set({ loading }),
  error: null,
  setError: (error) => set({ error }),
}));