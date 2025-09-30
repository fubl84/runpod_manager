import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`
          w-11 h-6 rounded-full peer
          transition-colors duration-200
          ${checked
            ? 'bg-[#34C759]'
            : 'bg-gray-300 dark:bg-gray-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}>
          <div className={`
            absolute top-[2px] left-[2px]
            w-5 h-5 bg-white rounded-full
            shadow-sm
            transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `} />
        </div>
      </div>
      {label && (
        <span className="ml-3 text-[13px] text-gray-700 dark:text-gray-300 select-none">
          {label}
        </span>
      )}
    </label>
  );
}