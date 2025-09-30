import React from 'react';

interface TerminalTab {
  id: string;
  title: string;
  active: boolean;
}

interface TerminalTabsProps {
  tabs: TerminalTab[];
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
}

export function TerminalTabs({ tabs, onTabClick, onTabClose, onNewTab }: TerminalTabsProps) {
  return (
    <div className="flex items-center bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      <div className="flex flex-1 min-w-0">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center px-4 py-2 cursor-pointer border-r border-gray-200 dark:border-gray-700 group min-w-0 ${
              tab.active
                ? 'bg-white dark:bg-[#282828] text-gray-900 dark:text-white'
                : 'bg-gray-50 dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252525]'
            }`}
            onClick={() => onTabClick(tab.id)}
          >
            <span className="text-[13px] truncate mr-2">{tab.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-opacity text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onNewTab}
        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors shrink-0 text-lg"
        title="New Terminal"
      >
        +
      </button>
    </div>
  );
}