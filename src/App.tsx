import React, { useState } from 'react';
import { RobotProvider, useRobot } from './context/RobotContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { URDFParser } from './parsers/urdfParser';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { InputModeSwitch } from './components/ui/InputModeSwitch';
import { FileUploader } from './components/ui/FileUploader';
import { TextEditor } from './components/ui/TextEditor';
import { ControlPanel } from './components/ui/ControlPanel';
import { InfoPanel } from './components/ui/InfoPanel';
import { RobotScene } from './components/3d/RobotScene';
import type { InputMode } from './types';

const AppContent: React.FC = () => {
  const { setURDFInput, setRobotState, robotState, urdfInput } = useRobot();
  const { t } = useLanguage();
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [textContent, setTextContent] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleFileLoad = (content: string, fileName: string, files?: File[]) => {
    try {
      const parser = new URDFParser(content);
      const { links, joints, rootLink } = parser.parse();
      
      const jointValues = new Map<string, number>();
      joints.forEach(joint => {
        jointValues.set(joint.name, 0);
      });

      setRobotState({
        jointValues,
        links,
        joints,
        rootLink,
      });

      setURDFInput({
        mode: 'text',
        content,
        files,
        fileName,
      });

      setTextContent(content);
      setInputMode('text');
    } catch (error) {
      console.error('Failed to parse URDF:', error);
      alert(t.alerts.fileFormatError);
    }
  };

  const handleTextLoad = (content?: string) => {
    const contentToParse = content || textContent;
    try {
      const parser = new URDFParser(contentToParse);
      const { links, joints, rootLink } = parser.parse();
      
      const jointValues = new Map<string, number>();
      joints.forEach(joint => {
        jointValues.set(joint.name, 0);
      });

      setRobotState({
        jointValues,
        links,
        joints,
        rootLink,
      });

      setURDFInput({
        mode: 'text',
        content: contentToParse,
      });
    } catch (error) {
      console.error('Failed to parse URDF:', error);
      alert(t.alerts.parseError);
    }
  };

  const handleTextChange = (content: string) => {
    setTextContent(content);
  };

  const handleFormat = () => {
  };

  const handleClear = () => {
    setTextContent('');
  };

  const handleExport = () => {
    const blob = new Blob([textContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = urdfInput?.fileName || 'robot.urdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed}>
          {!sidebarCollapsed && (
            <>
              <InputModeSwitch mode={inputMode} onModeChange={setInputMode} />
              
              {inputMode === 'file' ? (
                <FileUploader onFileLoad={handleFileLoad} />
              ) : (
                <TextEditor
                  content={textContent}
                  onChange={handleTextChange}
                  onLoad={handleTextLoad}
                  onFormat={handleFormat}
                  onClear={handleClear}
                  onExport={handleExport}
                />
              )}

              <ControlPanel />
              <InfoPanel />
            </>
          )}
        </Sidebar>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`fixed top-1/2 transform -translate-y-1/2 w-6 h-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 z-10 shadow-md ${sidebarCollapsed ? 'left-0' : 'left-96'}`}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg 
            className={`w-5 h-5 text-gray-700 dark:text-gray-300 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <MainContent className="flex-1">
          <RobotScene robotState={robotState} />
        </MainContent>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <RobotProvider>
        <AppContent />
      </RobotProvider>
    </LanguageProvider>
  );
};

export default App;
