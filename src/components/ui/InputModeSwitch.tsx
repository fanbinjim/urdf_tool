import React from 'react';
import type { InputMode } from '../../types';

interface InputModeSwitchProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

export const InputModeSwitch: React.FC<InputModeSwitchProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
      <button
        onClick={() => onModeChange('file')}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'file'
            ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        File Upload
      </button>
      <button
        onClick={() => onModeChange('text')}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'text'
            ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        Text Editor
      </button>
    </div>
  );
};
