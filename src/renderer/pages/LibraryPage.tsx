import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../stores/app-store';
import { CommandCard } from '../components/CommandCard';
import { Modal } from '../components/Modal';
import { CommandForm } from '../components/CommandForm';
import { Command } from '../../shared/types';

type ModalType = 'create' | 'edit' | 'delete' | null;

export function LibraryPage() {
  const { commands, pods, setCommands, addCommand, updateCommand, removeCommand } =
    useAppStore();
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const [deletingCommand, setDeletingCommand] = useState<Command | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [podFilter, setPodFilter] = useState<string>('');

  // Load commands from database on mount
  useEffect(() => {
    loadCommands();
  }, []);

  const loadCommands = async () => {
    try {
      setLoading(true);
      const commandsFromDb = await window.electronAPI.getCommands();
      setCommands(commandsFromDb);
    } catch (error) {
      console.error('Failed to load commands:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(commands.map((c) => c.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [commands]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    return commands.filter((cmd) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = !categoryFilter || cmd.category === categoryFilter;

      // Pod filter
      const matchesPod =
        !podFilter ||
        (podFilter === 'global' && !cmd.assignedPodId) ||
        cmd.assignedPodId === podFilter;

      return matchesSearch && matchesCategory && matchesPod;
    });
  }, [commands, searchQuery, categoryFilter, podFilter]);

  const handleCreateCommand = async (
    commandData: Omit<Command, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const newCommand = await window.electronAPI.createCommand(commandData);
      addCommand(newCommand);
      setModalType(null);
    } catch (error) {
      console.error('Failed to create command:', error);
      alert('Failed to create command. Please try again.');
    }
  };

  const handleUpdateCommand = async (
    commandData: Omit<Command, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!editingCommand) return;

    try {
      const updatedCommand = await window.electronAPI.updateCommand(
        editingCommand.id,
        commandData
      );
      if (updatedCommand) {
        updateCommand(editingCommand.id, updatedCommand);
      }
      setModalType(null);
      setEditingCommand(null);
    } catch (error) {
      console.error('Failed to update command:', error);
      alert('Failed to update command. Please try again.');
    }
  };

  const handleDeleteCommand = async () => {
    if (!deletingCommand) return;

    try {
      await window.electronAPI.deleteCommand(deletingCommand.id);
      removeCommand(deletingCommand.id);
      setModalType(null);
      setDeletingCommand(null);
    } catch (error) {
      console.error('Failed to delete command:', error);
      alert('Failed to delete command. Please try again.');
    }
  };

  const openCreateModal = () => {
    setEditingCommand(null);
    setModalType('create');
  };

  const openEditModal = (command: Command) => {
    setEditingCommand(command);
    setModalType('edit');
  };

  const openDeleteModal = (command: Command) => {
    setDeletingCommand(command);
    setModalType('delete');
  };

  const closeModal = () => {
    setModalType(null);
    setEditingCommand(null);
    setDeletingCommand(null);
  };

  const handleExecute = (command: Command) => {
    // TODO: Implement command execution in Phase 5
    console.log('Execute command:', command.name);
    alert(`Command execution will be implemented in Phase 5.\n\nCommand: ${command.name}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setPodFilter('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-[#282828]">
        <div className="text-gray-600 dark:text-gray-400">Loading commands...</div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-white dark:bg-[#282828]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Command Library</h2>
        <button
          onClick={openCreateModal}
          className="btn-primary"
        >
          Add Command
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Search commands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-macos w-full"
        />

        <div className="flex items-center space-x-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select-macos"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={podFilter}
            onChange={(e) => setPodFilter(e.target.value)}
            className="select-macos"
          >
            <option value="">All Pods</option>
            <option value="global">Global (No Pod)</option>
            {pods.map((pod) => (
              <option key={pod.id} value={pod.id}>
                {pod.name}
              </option>
            ))}
          </select>

          {(searchQuery || categoryFilter || podFilter) && (
            <button
              onClick={clearFilters}
              className="btn-secondary text-sm"
            >
              Clear Filters
            </button>
          )}

          <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
            {filteredCommands.length} of {commands.length} commands
          </div>
        </div>
      </div>

      {commands.length === 0 ? (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow dark:shadow-none border border-transparent dark:border-gray-700 p-8 text-center">
          <div className="text-gray-400 dark:text-gray-600 text-4xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No commands yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Build your command library to quickly execute common tasks.
          </p>
          <button
            onClick={openCreateModal}
            className="btn-primary"
          >
            Add First Command
          </button>
        </div>
      ) : filteredCommands.length === 0 ? (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow dark:shadow-none border border-transparent dark:border-gray-700 p-8 text-center">
          <div className="text-gray-400 dark:text-gray-600 text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No matching commands</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search or filters.</p>
          <button
            onClick={clearFilters}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCommands.map((command) => (
            <CommandCard
              key={command.id}
              command={command}
              onEdit={() => openEditModal(command)}
              onDelete={() => openDeleteModal(command)}
              onExecute={() => handleExecute(command)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalType === 'create' || modalType === 'edit'}
        onClose={closeModal}
        title={modalType === 'create' ? 'Create New Command' : 'Edit Command'}
        size="lg"
      >
        <CommandForm
          command={editingCommand}
          onSubmit={modalType === 'create' ? handleCreateCommand : handleUpdateCommand}
          onCancel={closeModal}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modalType === 'delete'}
        onClose={closeModal}
        title="Delete Command"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the command{' '}
            <span className="font-semibold">{deletingCommand?.name}</span>? This action
            cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeModal}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCommand}
              className="btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}