import React, { useState, useMemo } from 'react';
import { Command } from '../../shared/types';

interface CommandSelectorProps {
  commands: Command[];
  selectedPodId?: string | null;
  onSelect: (commandId: string) => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export function CommandSelector({
  commands,
  selectedPodId,
  onSelect,
  onCancel,
  title = 'Select Command to Execute',
  description = 'Choose a command from your library to run in the terminal',
}: CommandSelectorProps) {
  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter commands by pod assignment and search/category
  const filteredCommands = useMemo(() => {
    let filtered = commands;

    // Filter by pod if selectedPodId is provided
    if (selectedPodId) {
      filtered = filtered.filter(
        (cmd) => !cmd.assignedPodId || cmd.assignedPodId === selectedPodId
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cmd) =>
          cmd.name.toLowerCase().includes(query) ||
          cmd.command.toLowerCase().includes(query) ||
          cmd.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((cmd) => cmd.category === selectedCategory);
    }

    return filtered;
  }, [commands, selectedPodId, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(commands.map((cmd) => cmd.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [commands]);

  const handleSubmit = () => {
    if (selectedCommandId) {
      onSelect(selectedCommandId);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>

        {/* Search and Filter */}
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-macos flex-1 text-sm"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select-macos text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Command List */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
        {filteredCommands.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p className="mb-2">No commands found</p>
            <p className="text-xs">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Create commands in the Library page'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCommands.map((command) => (
              <div
                key={command.id}
                onClick={() => setSelectedCommandId(command.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedCommandId === command.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400'
                    : 'hover:bg-gray-50 dark:hover:bg-[#252525]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{command.name}</h4>
                      {command.category && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          {command.category}
                        </span>
                      )}
                    </div>
                    {command.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{command.description}</p>
                    )}
                    <code className="block mt-2 text-xs bg-gray-100 dark:bg-[#282828] text-gray-800 dark:text-gray-300 p-2 rounded font-mono">
                      {command.command}
                    </code>
                  </div>
                  <div className="ml-4">
                    <input
                      type="radio"
                      checked={selectedCommandId === command.id}
                      onChange={() => setSelectedCommandId(command.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedCommandId}
          className="btn-primary"
        >
          Execute Command
        </button>
      </div>
    </div>
  );
}