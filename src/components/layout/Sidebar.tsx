import React from 'react';

interface SidebarProps {
  children: React.ReactNode;
  collapsed?: boolean;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ children, collapsed = false, className = '' }) => {
  return (
    <aside className={`${collapsed ? 'w-0' : 'w-96'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300 ease-in-out ${className}`}>
      <div className={`${collapsed ? 'p-0' : 'p-4'} space-y-4`}>
        {children}
      </div>
    </aside>
  );
};
