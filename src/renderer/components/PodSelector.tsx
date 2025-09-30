import React from 'react';
import { PodProfile } from '../../shared/types';

interface PodSelectorProps {
  pods: PodProfile[];
  selectedPodId: string | null;
  onSelect: (podId: string) => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export function PodSelector({
  pods,
  selectedPodId,
  onSelect,
  onCancel,
  title = 'Select a Pod',
  description = 'Choose which pod to connect to',
}: PodSelectorProps) {
  const [selected, setSelected] = React.useState<string | null>(selectedPodId);

  const handleSubmit = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="space-y-4">
      {description && <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>}

      {pods.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No pods available.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Please create a pod first.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {pods.map((pod) => (
            <button
              key={pod.id}
              onClick={() => setSelected(pod.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selected === pod.id
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#1E1E1E]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{pod.name}</h4>
                  {pod.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{pod.description}</p>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 space-y-1">
                    <div>
                      IP: <span className="font-mono">{pod.ip}:{pod.port}</span>
                    </div>
                    <div>
                      SSH: <span className="font-mono">{pod.sshUrl}</span>
                    </div>
                  </div>
                </div>
                {selected === pod.id && (
                  <div className="ml-4">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selected || pods.length === 0}
          className="btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  );
}