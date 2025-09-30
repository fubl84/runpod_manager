import React, { useState, useEffect } from 'react';
import { Command } from '../../shared/types';
import { useAppStore } from '../stores/app-store';

interface CommandFormProps {
  command?: Command | null;
  onSubmit: (command: Omit<Command, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  command: string;
  assignedPodId: string;
  category: string;
  description: string;
}

interface FormErrors {
  name?: string;
  command?: string;
}

const COMMAND_CATEGORIES = [
  'Setup & Installation',
  'Training',
  'Generation',
  'File Management',
  'System',
  'Network',
  'Other',
];

export function CommandForm({ command, onSubmit, onCancel }: CommandFormProps) {
  const { pods } = useAppStore();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    command: '',
    assignedPodId: '',
    category: '',
    description: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (command) {
      setFormData({
        name: command.name,
        command: command.command,
        assignedPodId: command.assignedPodId || '',
        category: command.category || '',
        description: command.description || '',
      });
    }
  }, [command]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.command.trim()) {
      newErrors.command = 'Command is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        command: formData.command.trim(),
        assignedPodId: formData.assignedPodId || undefined,
        category: formData.category || undefined,
        description: formData.description.trim() || undefined,
      });
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Command Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={handleChange('name')}
          className={`input-macos w-full ${
            errors.name ? 'border-red-500 dark:border-red-500' : ''
          }`}
          placeholder="e.g., Start Kohya GUI"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Command *
        </label>
        <textarea
          value={formData.command}
          onChange={handleChange('command')}
          rows={4}
          className={`input-macos w-full resize-none font-mono text-sm ${
            errors.command ? 'border-red-500 dark:border-red-500' : ''
          }`}
          style={{height: 'auto', minHeight: '96px'}}
          placeholder="e.g., python kohya_gui.py --headless --listen 127.0.0.1"
        />
        {errors.command && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.command}</p>}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Tip: Use variables like {'<ip>'}, {'<port>'}, {'<localPort>'}, {'<sshUrl>'}, {'<sshKeyPath>'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={handleChange('category')}
            className="select-macos w-full"
          >
            <option value="">No category</option>
            {COMMAND_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assigned Pod
          </label>
          <select
            value={formData.assignedPodId}
            onChange={handleChange('assignedPodId')}
            className="select-macos w-full"
          >
            <option value="">No pod (global)</option>
            {pods.map((pod) => (
              <option key={pod.id} value={pod.id}>
                {pod.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={handleChange('description')}
          rows={2}
          className="input-macos w-full resize-none"
          style={{height: 'auto', minHeight: '56px'}}
          placeholder="Optional description of what this command does"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {command ? 'Update Command' : 'Create Command'}
        </button>
      </div>
    </form>
  );
}