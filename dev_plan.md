# RunPod Manager - Development Plan
**Author**: Christoph Seiler
**Company**: Flaming Battenberg
**Email**: info@flamingbattenberg.de
**Last Updated**: 2025-09-29

## Project Overview
A standalone Electron application for managing RunPod connections with an integrated terminal for SSH, tunneling, and file transfers. The app streamlines pod management by eliminating the need to manually update IPs, ports, and commands when switching between pods.

## Technology Stack

### Core Framework
- **Framework**: Electron with React + TypeScript
- **Terminal Emulator**: xterm.js with node-pty for full terminal functionality
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Build Tool**: Vite

### Data & Storage
- **Database**: SQLite3 with better-sqlite3
- **Configuration**: electron-store for app settings
- **File System**: Node.js fs APIs for SSH key management

### Development Tools
- **Package Manager**: npm
- **Bundler**: Electron Builder
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier

## Application Architecture

### Project Structure
```
src/
├── main/                   # Electron main process
│   ├── index.ts           # Main entry point
│   ├── database.ts        # SQLite setup
│   └── ipc-handlers.ts    # IPC communication
├── renderer/              # React frontend
│   ├── components/        # UI components
│   ├── pages/            # Main page components
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript interfaces
│   └── utils/            # Utility functions
├── shared/               # Shared types/constants
└── preload/             # Preload scripts
```

### Core Components
1. **App Container** - Main application wrapper
2. **Sidebar Navigation** - Pod/Library/Terminal/Settings navigation
3. **Pod Manager** - CRUD operations for pod profiles
4. **Command Library** - Command management and execution
5. **Terminal Container** - Multi-tab terminal with action buttons
6. **Settings Panel** - App configuration

## Data Models

### Pod Profile
```typescript
interface PodProfile {
  id: string;
  name: string;
  description: string;
  ip: string;
  port: number;
  localPort: number; // for tunneling
  sshUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Command
```typescript
interface Command {
  id: string;
  name: string;
  command: string;
  assignedPodId?: string;
  category?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### App Settings
```typescript
interface AppSettings {
  sshKeyPath: string;
  defaultTerminalBehavior: 'current' | 'new-tab';
  theme: 'light' | 'dark';
  terminalFont: string;
  terminalFontSize: number;
}
```

## Development Phases

### Phase 1: Project Setup & Core Architecture (Week 1)

#### Tasks
- [ ] Initialize Electron + React + TypeScript project with Vite
- [ ] Configure Tailwind CSS and basic styling
- [ ] Set up SQLite database with initial schema
- [ ] Create basic IPC communication structure
- [ ] Implement main window and basic navigation
- [ ] Set up development workflow (hot reload, debugging)

#### Deliverables
- Working Electron app with React frontend
- Database initialization and connection
- Basic navigation structure
- Development environment ready

### Phase 2: Terminal Integration (Week 1-2)

#### Tasks
- [ ] Integrate xterm.js terminal emulator
- [ ] Set up node-pty for terminal process management
- [ ] Implement multi-tab terminal functionality
- [ ] Create terminal context and state management
- [ ] Add basic terminal actions (new tab, close tab)
- [ ] Style terminal interface

#### Deliverables
- Fully functional terminal with tab support
- Terminal process management
- Basic terminal UI with VSCode-like experience

### Phase 3: Pod Management (Week 2)

#### Tasks
- [ ] Design and implement pod database schema
- [ ] Create pod CRUD operations (database layer)
- [ ] Build pod management UI components
- [ ] Implement pod form with validation
- [ ] Add pod list/grid view
- [ ] Create pod selection components
- [ ] Add import/export functionality

#### Deliverables
- Complete pod management system
- Form validation and error handling
- Pod data persistence
- Import/export capabilities

### Phase 4: Command Library (Week 3)

#### Tasks
- [ ] Design and implement command database schema
- [ ] Create command CRUD operations
- [ ] Build command library UI
- [ ] Implement search and filter functionality
- [ ] Add command categories
- [ ] Create command assignment to pods
- [ ] Implement command templates with variables

#### Deliverables
- Full command library management
- Search and categorization
- Pod assignment system
- Template variable substitution

### Phase 5: Terminal Actions Integration (Week 3-4)

#### Tasks
- [ ] Implement SSH connection automation
  - Pod selection dialog
  - Command template building
  - Terminal execution
- [ ] Create tunnel setup functionality
  - Port forwarding command generation
  - Tab management for tunnels
- [ ] Build file transfer system
  - SCP upload/download dialogs
  - File picker integration
  - Progress indication
- [ ] Add command execution from library
  - Command filtering by pod
  - Variable substitution
  - Execution tracking

#### Deliverables
- One-click SSH connections
- Automated tunnel setup
- File transfer functionality
- Library command execution

### Phase 6: Settings & Configuration (Week 4)

#### Tasks
- [ ] Create settings management system
- [ ] Build settings UI panel
- [ ] Implement SSH key path configuration
- [ ] Add terminal behavior preferences
- [ ] Create theme management
- [ ] Add keyboard shortcuts
- [ ] Implement data backup/restore

#### Deliverables
- Complete settings system
- User preferences management
- Keyboard shortcuts
- Data backup functionality

### Phase 7: Polish & Testing (Week 5)

#### Tasks
- [ ] Implement comprehensive error handling
- [ ] Add loading states and progress indicators
- [ ] Create user onboarding flow
- [ ] Optimize performance and memory usage
- [ ] Write unit and integration tests
- [ ] Conduct user testing and feedback
- [ ] Fix bugs and polish UI/UX

#### Deliverables
- Robust error handling
- Smooth user experience
- Test coverage
- Performance optimization

### Phase 8: Build & Distribution (Week 6)

#### Tasks
- [ ] Configure Electron Builder for macOS
- [ ] Set up code signing (if needed)
- [ ] Create application icons and assets
- [ ] Build and test on macOS (Intel and M1)
- [ ] Create installation documentation
- [ ] Package for distribution
- [ ] Create user manual

#### Deliverables
- Signed macOS application
- Installation package
- User documentation
- Distribution-ready build

## User Interface Design

### Main Window Layout
```
┌─────────────────────────────────────────────────────────┐
│ RunPod Manager                              [- □ ×]     │
├─────────────┬───────────────────────────────────────────┤
│             │ ┌─ Pods ─┐ ┌─ Library ─┐ ┌─ Terminal ─┐   │
│  Sidebar    │ │        │ │           │ │  Tab 1    │   │
│             │ │ Pod    │ │ Commands  │ │  Tab 2    │   │
│ • Pods      │ │ Cards  │ │ List      │ │  Tab 3 +  │   │
│ • Library   │ │        │ │           │ │           │   │
│ • Terminal  │ │ [Add]  │ │ [Search]  │ │ Terminal  │   │
│ • Settings  │ │        │ │           │ │ Content   │   │
│             │ │        │ │ [Add Cmd] │ │           │   │
│             │ └────────┘ └───────────┘ │ [Actions] │   │
│             │                         └───────────┘   │
└─────────────┴───────────────────────────────────────────┘
```

### Terminal Actions Bar
```
┌─────────────────────────────────────────────────────────┐
│ [SSH] [Tunnel] [Upload] [Download] [Command] [New Tab]  │
└─────────────────────────────────────────────────────────┘
```

## Technical Implementation Details

### Terminal Integration
```typescript
// Terminal component with xterm.js
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { spawn } from 'node-pty';

class TerminalService {
  private terminals: Map<string, Terminal> = new Map();
  private processes: Map<string, IPty> = new Map();

  createTerminal(id: string): Terminal {
    const terminal = new Terminal({
      theme: { background: '#1e1e1e' },
      fontFamily: 'Monaco, monospace',
      fontSize: 14
    });

    const ptyProcess = spawn(process.platform === 'win32' ? 'powershell.exe' : 'zsh', [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME,
      env: process.env
    });

    terminal.onData(data => ptyProcess.write(data));
    ptyProcess.onData(data => terminal.write(data));

    this.terminals.set(id, terminal);
    this.processes.set(id, ptyProcess);

    return terminal;
  }
}
```

### Command Template System
```typescript
class CommandTemplateService {
  substituteVariables(command: string, pod: PodProfile, sshKeyPath: string): string {
    return command
      .replace(/<ip>/g, pod.ip)
      .replace(/<port>/g, pod.port.toString())
      .replace(/<localPort>/g, pod.localPort.toString())
      .replace(/<sshUrl>/g, pod.sshUrl)
      .replace(/<sshKeyPath>/g, sshKeyPath);
  }

  buildSSHCommand(pod: PodProfile, sshKeyPath: string): string {
    return `ssh ${pod.sshUrl} -i ${sshKeyPath}`;
  }

  buildTunnelCommand(pod: PodProfile, sshKeyPath: string): string {
    return `ssh -N -L ${pod.localPort}:127.0.0.1:7860 -i ${sshKeyPath} -p ${pod.port} root@${pod.ip}`;
  }
}
```

### Database Schema
```sql
-- Pods table
CREATE TABLE pods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  ip TEXT NOT NULL,
  port INTEGER NOT NULL,
  local_port INTEGER NOT NULL,
  ssh_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Commands table
CREATE TABLE commands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  command TEXT NOT NULL,
  assigned_pod_id TEXT,
  category TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_pod_id) REFERENCES pods(id)
);
```

## Security Considerations

### Data Protection
- Store only SSH key paths, never the actual keys
- Encrypt sensitive data in SQLite database
- Validate all user inputs to prevent injection attacks
- Sandboxed terminal execution

### SSH Security
- Use secure SSH key management
- Validate SSH connections before execution
- Implement connection timeouts
- Secure storage of connection parameters

## Performance Optimization

### Terminal Performance
- Lazy loading of terminal instances
- Efficient terminal tab management
- Memory cleanup on tab close
- Optimized terminal rendering

### Database Performance
- Indexed queries for search functionality
- Connection pooling for SQLite
- Batch operations for imports
- Efficient data pagination

### UI Performance
- React component memoization
- Virtual scrolling for large lists
- Debounced search inputs
- Optimistic UI updates

## Error Handling Strategy

### Network Errors
- Connection timeout handling
- Retry mechanisms for failed connections
- Clear error messages for users
- Fallback options for failed operations

### System Errors
- File system permission errors
- SSH key validation
- Port availability checking
- Process management errors

### User Input Validation
- IP address format validation
- Port range validation
- Command syntax checking
- File path validation

## Testing Strategy

### Unit Tests
- Database operations
- Command template processing
- Utility functions
- Component logic

### Integration Tests
- Terminal command execution
- File transfer operations
- Database queries
- IPC communication

### End-to-End Tests
- Complete user workflows
- SSH connection testing
- File transfer validation
- Settings persistence

## Documentation Plan

### User Documentation
- Installation guide for macOS
- Quick start tutorial
- Feature overview with screenshots
- Troubleshooting guide
- FAQ section

### Developer Documentation
- Setup and build instructions
- Architecture overview
- API documentation
- Contributing guidelines
- Code style guide

## Deployment & Distribution

### Build Configuration
```json
{
  "build": {
    "appId": "com.runpodmanager.app",
    "productName": "RunPod Manager",
    "directories": {
      "output": "dist"
    },
    "mac": {
      "category": "public.app-category.developer-tools",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ]
    }
  }
}
```

### macOS Compatibility
- Support macOS 10.15 (Catalina) and later
- Native Apple Silicon (M1/M2) support
- Intel x64 compatibility
- Dark mode support

## Success Metrics

### Functional Requirements
- ✅ Create, edit, delete pod profiles
- ✅ Manage command library with search
- ✅ One-click SSH connections
- ✅ Automated tunnel setup
- ✅ Seamless file transfers
- ✅ Multi-tab terminal support

### Performance Targets
- App launch time: < 3 seconds
- Terminal response time: < 100ms
- File transfer progress: Real-time updates
- Memory usage: < 200MB idle
- Database queries: < 50ms

### User Experience Goals
- Intuitive interface requiring minimal learning
- Consistent behavior across all features
- Clear error messages and recovery options
- Keyboard shortcuts for power users
- Responsive design for different screen sizes

## Risk Assessment

### Technical Risks
- **Terminal integration complexity**: Mitigate with early prototyping
- **Cross-platform SSH behavior**: Test on multiple macOS versions
- **File transfer reliability**: Implement robust error handling
- **Performance with multiple terminals**: Profile and optimize early

### Mitigation Strategies
- Early technical spikes for risky components
- Comprehensive testing on target hardware
- User feedback integration throughout development
- Regular performance monitoring and optimization

## Future Enhancements (Post-MVP)

### Advanced Features
- RunPod API integration for pod lifecycle management
- Command scheduling and automation
- Team collaboration and sharing
- Plugin system for custom integrations
- Advanced terminal features (split panes, themes)

### Quality of Life
- Global keyboard shortcuts
- Command history and auto-completion
- Backup and sync across devices
- Advanced search with regex support
- Custom themes and appearance options

This comprehensive development plan provides a roadmap for creating a robust, user-friendly RunPod Manager application that meets all specified requirements while maintaining high code quality and user experience standards.