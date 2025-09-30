import React, { useState } from 'react';

interface FileTransferDialogProps {
  type: 'upload' | 'download';
  onSubmit: (data: FileTransferData) => void;
  onCancel: () => void;
}

export interface FileTransferData {
  localPath: string;
  remotePath: string;
}

export function FileTransferDialog({ type, onSubmit, onCancel }: FileTransferDialogProps) {
  const [localPath, setLocalPath] = useState('');
  const [remotePath, setRemotePath] = useState('');
  const [error, setError] = useState('');

  const handleSelectLocal = async () => {
    try {
      if (type === 'upload') {
        const path = await window.electronAPI.selectFile();
        if (path) setLocalPath(path);
      } else {
        const path = await window.electronAPI.selectFolder();
        if (path) setLocalPath(path);
      }
    } catch (error) {
      console.error('Failed to select file/folder:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!localPath.trim()) {
      setError('Local path is required');
      return;
    }

    if (!remotePath.trim()) {
      setError('Remote path is required');
      return;
    }

    onSubmit({ localPath, remotePath });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
        <p className="text-sm text-blue-800">
          {type === 'upload'
            ? '📤 Upload a file from your computer to the pod'
            : '📥 Download a file from the pod to your computer'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {type === 'upload' ? 'Local File' : 'Local Target Folder'} *
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={localPath}
            onChange={(e) => setLocalPath(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              type === 'upload'
                ? '/path/to/local/file.txt'
                : '/path/to/local/folder'
            }
          />
          <button
            type="button"
            onClick={handleSelectLocal}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Browse
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {type === 'upload' ? 'Remote Target Path' : 'Remote File Path'} *
        </label>
        <input
          type="text"
          value={remotePath}
          onChange={(e) => setRemotePath(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={
            type === 'upload'
              ? '/workspace/dataset/'
              : '/workspace/outputs/model.safetensors'
          }
        />
        <p className="mt-1 text-xs text-gray-500">
          {type === 'upload'
            ? 'Specify the remote directory path (with trailing /)'
            : 'Specify the full path to the remote file'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {type === 'upload' ? 'Upload' : 'Download'}
        </button>
      </div>
    </form>
  );
}