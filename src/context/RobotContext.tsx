import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { RobotState, URDFInput } from '../types';
import * as THREE from 'three';

interface RobotContextType {
  robotState: RobotState | null;
  urdfInput: URDFInput;
  setRobotState: (state: RobotState | null) => void;
  setURDFInput: (input: URDFInput) => void;
  updateJointValue: (jointName: string, value: number) => void;
  resetJoints: () => void;
  getFileByPath: (path: string) => File | undefined;
  getSTLGeometry: (filename: string) => THREE.BufferGeometry | undefined;
  setSTLGeometry: (filename: string, geometry: THREE.BufferGeometry) => void;
}

const RobotContext = createContext<RobotContextType | undefined>(undefined);

export const RobotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [robotState, setRobotState] = useState<RobotState | null>(null);
  const [urdfInput, setURDFInput] = useState<URDFInput>({
    mode: 'file',
    content: '',
  });
  
  // STL geometry cache
  const stlCacheRef = useRef<Map<string, THREE.BufferGeometry>>(new Map());
  // Use ref to store files to avoid re-creating getFileByPath every time files change
  const filesRef = useRef<File[] | undefined>(undefined);
  
  const getSTLGeometry = useCallback((filename: string): THREE.BufferGeometry | undefined => {
    return stlCacheRef.current.get(filename);
  }, []);
  
  const setSTLGeometry = useCallback((filename: string, geometry: THREE.BufferGeometry) => {
    stlCacheRef.current.set(filename, geometry);
  }, []);

  // Update filesRef when urdfInput.files changes
  React.useEffect(() => {
    filesRef.current = urdfInput.files;
  }, [urdfInput.files]);

  const updateJointValue = useCallback((jointName: string, value: number) => {
    setRobotState(prev => {
      if (!prev) return null;
      const newJointValues = new Map(prev.jointValues);
      newJointValues.set(jointName, value);
      return { ...prev, jointValues: newJointValues };
    });
  }, []);

  const resetJoints = useCallback(() => {
    setRobotState(prev => {
      if (!prev) return null;
      const newJointValues = new Map<string, number>();
      prev.joints.forEach(joint => {
        newJointValues.set(joint.name, 0);
      });
      return { ...prev, jointValues: newJointValues };
    });
  }, []);

  const getFileByPath = useCallback((path: string) => {
    if (!filesRef.current) return undefined;
    
    console.log('Looking for file:', path);
    
    // Normalize the path
    const normalizedPath = path.replace(/^\.\//, '').replace(/^\.\//, '');
    console.log('Normalized path:', normalizedPath);
    
    // Try different matching strategies
    for (const file of filesRef.current) {
      console.log('Checking file:', file.name, file.webkitRelativePath);
      
      // Strategy 1: Exact match by filename
      if (file.name === normalizedPath.split('/').pop()) {
        console.log('Found by filename:', file.name);
        return file;
      }
      
      // Strategy 2: Match by relative path
      if (file.webkitRelativePath) {
        // Check if the relative path ends with the normalized path
        if (file.webkitRelativePath.endsWith(normalizedPath)) {
          console.log('Found by relative path:', file.webkitRelativePath);
          return file;
        }
        // Check if the relative path ends with the original path
        if (file.webkitRelativePath.endsWith(path)) {
          console.log('Found by original path:', file.webkitRelativePath);
          return file;
        }
      }
      
      // Strategy 3: Match by partial path
      const fileName = file.name.toLowerCase();
      const pathFileName = normalizedPath.split('/').pop()?.toLowerCase();
      if (pathFileName && fileName.includes(pathFileName)) {
        console.log('Found by partial match:', file.name);
        return file;
      }
    }
    
    console.log('File not found:', path);
    return undefined;
  }, []);

  return (
    <RobotContext.Provider
      value={{
        robotState,
        urdfInput,
        setRobotState,
        setURDFInput,
        updateJointValue,
        resetJoints,
        getFileByPath,
        getSTLGeometry,
        setSTLGeometry,
      }}
    >
      {children}
    </RobotContext.Provider>
  );
};

export const useRobot = () => {
  const context = useContext(RobotContext);
  if (context === undefined) {
    throw new Error('useRobot must be used within a RobotProvider');
  }
  return context;
};
