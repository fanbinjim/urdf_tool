import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main className="flex-1 bg-gray-100 dark:bg-gray-950 overflow-hidden">
      {children}
    </main>
  );
};
