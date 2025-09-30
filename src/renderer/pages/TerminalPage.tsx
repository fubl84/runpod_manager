import React, { useState, useEffect } from 'react';
import { Terminal } from '../components/Terminal';
import { TerminalTabs } from '../components/TerminalTabs';
import { Modal } from '../components/Modal';
import { PodSelector } from '../components/PodSelector';
import { CommandSelector } from '../components/CommandSelector';
import { Toggle } from '../components/Toggle';
import { FileTransferDialog, FileTransferData } from '../components/FileTransferDialog';
import { useAppStore } from '../stores/app-store';
import { CommandTemplateService } from '../../shared/command-templates';

interface TerminalTab {
  id: string;
  title: string;
  active: boolean;
}

type ActionType = 'ssh' | 'tunnel' | 'upload' | 'download' | 'command' | 'selectPod' | null;

export function TerminalPage() {
  const { pods, selectedPod, settings, commands, setSettings } = useAppStore();
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: 'terminal-1', title: 'Terminal 1', active: true },
  ]);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null);

  const activeTab = tabs.find((tab) => tab.active);

  const handleTabClick = (id: string) => {
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        active: tab.id === id,
      }))
    );
  };

  const handleTabClose = (id: string) => {
    const tabIndex = tabs.findIndex((tab) => tab.id === id);
    const isActive = tabs[tabIndex].active;

    if (tabs.length === 1) {
      // Don't close the last tab, create a new one instead
      const newId = `terminal-${Date.now()}`;
      setTabs([{ id: newId, title: `Terminal ${tabs.length + 1}`, active: true }]);
      return;
    }

    const newTabs = tabs.filter((tab) => tab.id !== id);

    // If we closed the active tab, activate the previous or next tab
    if (isActive) {
      const newActiveIndex = Math.max(0, tabIndex - 1);
      newTabs[newActiveIndex].active = true;
    }

    setTabs(newTabs);
  };

  const handleNewTab = () => {
    const newId = `terminal-${Date.now()}`;
    setTabs((prev) => [
      ...prev.map((tab) => ({ ...tab, active: false })),
      { id: newId, title: `Terminal ${prev.length + 1}`, active: true },
    ]);
  };

  // Execute command in terminal (respects defaultTerminalBehavior setting)
  const executeCommand = async (command: string) => {
    let targetTabId: string;

    // Check if we should create a new tab or use current
    if (settings.defaultTerminalBehavior === 'new-tab') {
      // Create a new tab and switch to it
      const newId = `terminal-${Date.now()}`;
      setTabs((prev) => [
        ...prev.map((tab) => ({ ...tab, active: false })),
        { id: newId, title: `Terminal ${prev.length + 1}`, active: true },
      ]);
      targetTabId = newId;

      // Wait a bit for the tab to be created and terminal to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      // Use the current active tab
      if (!activeTab) return;
      targetTabId = activeTab.id;
    }

    try {
      // Write command to terminal
      await window.electronAPI.writeToTerminal(targetTabId, command + '\n');
    } catch (error) {
      console.error('Failed to execute command:', error);
      alert('Failed to execute command');
    }
  };

  // Handle SSH connection
  const handleSSH = () => {
    if (pods.length === 0) {
      alert('Please create a pod first');
      return;
    }
    setActionType('ssh');
    setSelectedPodId(selectedPod?.id || pods[0].id);
  };

  const handleSSHConnect = (podId: string) => {
    const pod = pods.find((p) => p.id === podId);
    if (!pod) return;

    const sshKeyPath = settings.sshKeyPath || '~/.ssh/id_ed25519';
    const command = CommandTemplateService.buildSSHCommand(pod, sshKeyPath);

    executeCommand(command);
    setActionType(null);
  };

  // Handle Tunnel setup
  const handleTunnel = () => {
    if (pods.length === 0) {
      alert('Please create a pod first');
      return;
    }
    setActionType('tunnel');
    setSelectedPodId(selectedPod?.id || pods[0].id);
  };

  const handleTunnelConnect = (podId: string) => {
    const pod = pods.find((p) => p.id === podId);
    if (!pod) return;

    const sshKeyPath = settings.sshKeyPath || '~/.ssh/id_ed25519';
    const command = CommandTemplateService.buildTunnelCommand(pod, sshKeyPath);

    executeCommand(command);
    setActionType(null);
  };

  // Handle Upload
  const handleUpload = () => {
    if (pods.length === 0) {
      alert('Please create a pod first');
      return;
    }
    setActionType('upload');
    setSelectedPodId(selectedPod?.id || pods[0].id);
  };

  const handleUploadSubmit = (data: FileTransferData) => {
    const pod = pods.find((p) => p.id === selectedPodId);
    if (!pod) return;

    const sshKeyPath = settings.sshKeyPath || '~/.ssh/id_ed25519';
    const command = CommandTemplateService.buildUploadCommand(
      pod,
      sshKeyPath,
      data.localPath,
      data.remotePath
    );

    executeCommand(command);
    setActionType(null);
  };

  // Handle Download
  const handleDownload = () => {
    if (pods.length === 0) {
      alert('Please create a pod first');
      return;
    }
    setActionType('download');
    setSelectedPodId(selectedPod?.id || pods[0].id);
  };

  const handleDownloadSubmit = (data: FileTransferData) => {
    const pod = pods.find((p) => p.id === selectedPodId);
    if (!pod) return;

    const sshKeyPath = settings.sshKeyPath || '~/.ssh/id_ed25519';
    const command = CommandTemplateService.buildDownloadCommand(
      pod,
      sshKeyPath,
      data.remotePath,
      data.localPath
    );

    executeCommand(command);
    setActionType(null);
  };

  // Handle Command execution from library
  const handleCommand = () => {
    if (commands.length === 0) {
      alert('Please create commands in the Library first');
      return;
    }
    setActionType('command');
  };

  const handleCommandSelect = (commandId: string) => {
    const command = commands.find((c) => c.id === commandId);
    if (!command) return;

    // If command is assigned to a specific pod, use that pod
    if (command.assignedPodId) {
      const pod = pods.find((p) => p.id === command.assignedPodId);
      if (!pod) {
        alert('The pod assigned to this command no longer exists');
        return;
      }

      const sshKeyPath = settings.sshKeyPath || '~/.ssh/id_ed25519';
      const substitutedCommand = CommandTemplateService.substituteVariables(
        command.command,
        pod,
        sshKeyPath
      );

      executeCommand(substitutedCommand);
      setActionType(null);
    } else {
      // Command is not assigned to a pod, ask user to select one if command uses variables
      if (CommandTemplateService.hasVariables(command.command)) {
        setSelectedCommandId(commandId);
        setActionType('selectPod');
      } else {
        // No variables, execute directly
        executeCommand(command.command);
        setActionType(null);
      }
    }
  };

  const handlePodSelectForCommand = (podId: string) => {
    if (!selectedCommandId) return;

    const command = commands.find((c) => c.id === selectedCommandId);
    const pod = pods.find((p) => p.id === podId);
    if (!command || !pod) return;

    const sshKeyPath = settings.sshKeyPath || '~/.ssh/id_ed25519';
    const substitutedCommand = CommandTemplateService.substituteVariables(
      command.command,
      pod,
      sshKeyPath
    );

    executeCommand(substitutedCommand);
    setActionType(null);
    setSelectedCommandId(null);
  };

  const closeModal = () => {
    setActionType(null);
    setSelectedPodId(null);
    setSelectedCommandId(null);
  };

  const handleToggleTerminalBehavior = async (useCurrentTab: boolean) => {
    const newBehavior = useCurrentTab ? 'current' : 'new-tab';
    const updatedSettings = await window.electronAPI.updateSettings({
      defaultTerminalBehavior: newBehavior,
    });
    setSettings(updatedSettings);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#282828]">
      {/* Action Buttons Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-gray-700">
        <Toggle
          checked={settings.defaultTerminalBehavior === 'current'}
          onChange={handleToggleTerminalBehavior}
          label="Use Current Tab"
        />
        <div className="flex items-center space-x-2">
          <button onClick={handleSSH} className="btn-primary" style={{backgroundColor: '#34C759'}}>
            SSH
          </button>
          <button onClick={handleTunnel} className="btn-primary">
            Tunnel
          </button>
          <button onClick={handleUpload} className="btn-primary" style={{backgroundColor: '#AF52DE'}}>
            Upload
          </button>
          <button onClick={handleDownload} className="btn-primary" style={{backgroundColor: '#FF9500'}}>
            Download
          </button>
          <button onClick={handleCommand} className="btn-secondary">
            Command
          </button>
        </div>
      </div>

      {/* Terminal Tabs */}
      <TerminalTabs
        tabs={tabs}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
      />

      {/* Terminal Content */}
      <div className="flex-1 relative">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`absolute inset-0 ${tab.active ? 'block' : 'hidden'}`}
          >
            <Terminal id={tab.id} onClose={() => handleTabClose(tab.id)} />
          </div>
        ))}
      </div>

      {/* SSH/Tunnel Pod Selector Modal */}
      {(actionType === 'ssh' || actionType === 'tunnel') && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          title={actionType === 'ssh' ? 'SSH Connection' : 'Setup Tunnel'}
          size="md"
        >
          <PodSelector
            pods={pods}
            selectedPodId={selectedPodId}
            onSelect={actionType === 'ssh' ? handleSSHConnect : handleTunnelConnect}
            onCancel={closeModal}
            title={actionType === 'ssh' ? 'Select Pod to Connect' : 'Select Pod for Tunnel'}
            description={
              actionType === 'ssh'
                ? 'Choose which pod to establish an SSH connection to'
                : 'Choose which pod to create a tunnel for'
            }
          />
        </Modal>
      )}

      {/* Upload Modal */}
      {actionType === 'upload' && selectedPodId && (
        <Modal isOpen={true} onClose={closeModal} title="Upload File" size="md">
          <FileTransferDialog
            type="upload"
            onSubmit={handleUploadSubmit}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {/* Download Modal */}
      {actionType === 'download' && selectedPodId && (
        <Modal isOpen={true} onClose={closeModal} title="Download File" size="md">
          <FileTransferDialog
            type="download"
            onSubmit={handleDownloadSubmit}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {/* Command Selector Modal */}
      {actionType === 'command' && (
        <Modal isOpen={true} onClose={closeModal} title="Execute Command" size="lg">
          <CommandSelector
            commands={commands}
            selectedPodId={selectedPod?.id}
            onSelect={handleCommandSelect}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {/* Pod Selector for Command with Variables */}
      {actionType === 'selectPod' && (
        <Modal isOpen={true} onClose={closeModal} title="Select Pod for Command" size="md">
          <PodSelector
            pods={pods}
            selectedPodId={selectedPod?.id || null}
            onSelect={handlePodSelectForCommand}
            onCancel={closeModal}
            title="Select Pod for Variable Substitution"
            description="This command uses variables. Select a pod to use for variable substitution."
          />
        </Modal>
      )}
    </div>
  );
}