import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { RobotState, URDFInput } from '../types';

interface RobotContextType {
  robotState: RobotState | null;
  urdfInput: URDFInput;
  setRobotState: (state: RobotState | null) => void;
  setURDFInput: (input: URDFInput) => void;
  updateJointValue: (jointName: string, value: number) => void;
  resetJoints: () => void;
}

const RobotContext = createContext<RobotContextType | undefined>(undefined);

export const RobotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [robotState, setRobotState] = useState<RobotState | null>(null);
  const [urdfInput, setURDFInput] = useState<URDFInput>({
    mode: 'file',
    content: '',
  });

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

  return (
    <RobotContext.Provider
      value={{
        robotState,
        urdfInput,
        setRobotState,
        setURDFInput,
        updateJointValue,
        resetJoints,
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
