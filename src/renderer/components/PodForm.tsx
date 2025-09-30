import React, { useState, useEffect } from 'react';
import { PodProfile } from '../../shared/types';

interface PodFormProps {
  pod?: PodProfile | null;
  onSubmit: (pod: Omit<PodProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  description: string;
  ip: string;
  port: string;
  localPort: string;
  sshUrl: string;
}

interface FormErrors {
  name?: string;
  ip?: string;
  port?: string;
  localPort?: string;
  sshUrl?: string;
}

export function PodForm({ pod, onSubmit, onCancel }: PodFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    ip: '',
    port: '',
    localPort: '',
    sshUrl: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (pod) {
      setFormData({
        name: pod.name,
        description: pod.description,
        ip: pod.ip,
        port: pod.port.toString(),
        localPort: pod.localPort.toString(),
        sshUrl: pod.sshUrl,
      });
    }
  }, [pod]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.ip.trim()) {
      newErrors.ip = 'IP address is required';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.ip)) {
      newErrors.ip = 'Invalid IP address format';
    }

    if (!formData.port) {
      newErrors.port = 'Port is required';
    } else {
      const portNum = parseInt(formData.port);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        newErrors.port = 'Port must be between 1 and 65535';
      }
    }

    if (!formData.localPort) {
      newErrors.localPort = 'Local port is required';
    } else {
      const portNum = parseInt(formData.localPort);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        newErrors.localPort = 'Local port must be between 1 and 65535';
      }
    }

    if (!formData.sshUrl.trim()) {
      newErrors.sshUrl = 'SSH URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        ip: formData.ip.trim(),
        port: parseInt(formData.port),
        localPort: parseInt(formData.localPort),
        sshUrl: formData.sshUrl.trim(),
      });
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
          Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={handleChange('name')}
          className={`input-macos w-full ${
            errors.name ? 'border-red-500 dark:border-red-500' : ''
          }`}
          placeholder="e.g., Kohya Training Pod"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
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
          placeholder="Optional description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            IP Address *
          </label>
          <input
            type="text"
            value={formData.ip}
            onChange={handleChange('ip')}
            className={`input-macos w-full ${
              errors.ip ? 'border-red-500 dark:border-red-500' : ''
            }`}
            placeholder="e.g., 213.173.98.205"
          />
          {errors.ip && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ip}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Port *
          </label>
          <input
            type="number"
            value={formData.port}
            onChange={handleChange('port')}
            className={`input-macos w-full ${
              errors.port ? 'border-red-500 dark:border-red-500' : ''
            }`}
            placeholder="e.g., 15353"
          />
          {errors.port && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.port}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Local Port (for tunneling) *
        </label>
        <input
          type="number"
          value={formData.localPort}
          onChange={handleChange('localPort')}
          className={`input-macos w-full ${
            errors.localPort ? 'border-red-500 dark:border-red-500' : ''
          }`}
          placeholder="e.g., 7866"
        />
        {errors.localPort && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.localPort}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          SSH URL *
        </label>
        <input
          type="text"
          value={formData.sshUrl}
          onChange={handleChange('sshUrl')}
          className={`input-macos w-full ${
            errors.sshUrl ? 'border-red-500 dark:border-red-500' : ''
          }`}
          placeholder="e.g., user@ssh.runpod.io"
        />
        {errors.sshUrl && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.sshUrl}</p>}
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
          {pod ? 'Update Pod' : 'Create Pod'}
        </button>
      </div>
    </form>
  );
}