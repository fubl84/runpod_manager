import React from 'react';
import { PodProfile } from '../../shared/types';

interface PodCardProps {
  pod: PodProfile;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onConnect?: () => void;
}

export function PodCard({
  pod,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onConnect,
}: PodCardProps) {
  return (
    <div
      className={`bg-white dark:bg-[#1E1E1E] rounded-lg shadow-md dark:shadow-none border border-transparent dark:border-gray-700 p-4 cursor-pointer transition-all hover:shadow-lg dark:hover:border-gray-600 ${
        isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-[15px]">{pod.name}</h3>
          {pod.description && (
            <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-1">{pod.description}</p>
          )}
        </div>
        {isSelected && (
          <div className="ml-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              Active
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 text-[13px] text-gray-700 dark:text-gray-300 mb-4">
        <div className="flex items-center">
          <span className="font-medium w-24">IP:</span>
          <span className="text-gray-600 dark:text-gray-400 font-mono">{pod.ip}:{pod.port}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium w-24">Local Port:</span>
          <span className="text-gray-600 dark:text-gray-400 font-mono">{pod.localPort}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium w-24">SSH URL:</span>
          <span className="text-gray-600 dark:text-gray-400 font-mono text-[12px] truncate">{pod.sshUrl}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        {onConnect && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConnect();
            }}
            className="btn-primary flex-1"
            style={{backgroundColor: '#34C759'}}
          >
            Connect
          </button>
        )}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="btn-secondary"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="btn-danger"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}