import React from 'react';
import { Command } from '../../shared/types';
import { useAppStore } from '../stores/app-store';

interface CommandCardProps {
  command: Command;
  onEdit?: () => void;
  onDelete?: () => void;
  onExecute?: () => void;
}

export function CommandCard({ command, onEdit, onDelete, onExecute }: CommandCardProps) {
  const { pods } = useAppStore();
  const assignedPod = pods.find((p) => p.id === command.assignedPodId);

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-md dark:shadow-none border border-transparent dark:border-gray-700 p-4 hover:shadow-lg dark:hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{command.name}</h3>
          {command.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{command.description}</p>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="bg-gray-50 dark:bg-[#282828] rounded p-3 font-mono text-xs text-gray-800 dark:text-gray-300 overflow-x-auto">
          {command.command}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        {command.category && (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {command.category}
          </span>
        )}
        {assignedPod ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            📌 {assignedPod.name}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            Global
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        {onExecute && (
          <button
            onClick={onExecute}
            className="btn-primary flex-1"
            style={{backgroundColor: '#34C759'}}
          >
            Execute
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="btn-secondary"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="btn-danger"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}