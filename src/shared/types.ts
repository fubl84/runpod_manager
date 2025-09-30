export interface PodProfile {
  id: string;
  name: string;
  description: string;
  ip: string;
  port: number;
  localPort: number;
  sshUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Command {
  id: string;
  name: string;
  command: string;
  assignedPodId?: string;
  category?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  sshKeyPath: string;
  defaultTerminalBehavior: 'current' | 'new-tab';
  theme: 'light' | 'dark';
  terminalFont: string;
  terminalFontSize: number;
}

export interface TerminalTab {
  id: string;
  title: string;
  active: boolean;
  created: Date;
}