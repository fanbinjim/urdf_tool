import React, { useState } from 'react';
import { RobotProvider, useRobot } from './context/RobotContext';
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
  const { setURDFInput, setRobotState, robotState } = useRobot();
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [textContent, setTextContent] = useState('');

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
        mode: 'file',
        content,
        files,
        fileName,
      });

      setTextContent(content);
    } catch (error) {
      console.error('Failed to parse URDF:', error);
      alert('Failed to parse URDF file. Please check the file format.');
    }
  };

  const handleTextLoad = () => {
    try {
      const parser = new URDFParser(textContent);
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
        content: textContent,
      });
    } catch (error) {
      console.error('Failed to parse URDF:', error);
      alert('Failed to parse URDF content. Please check the XML format.');
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

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar>
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
            />
          )}

          <ControlPanel />
          <InfoPanel />
        </Sidebar>

        <MainContent>
          <RobotScene robotState={robotState} />
        </MainContent>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <RobotProvider>
      <AppContent />
    </RobotProvider>
  );
};

export default App;
