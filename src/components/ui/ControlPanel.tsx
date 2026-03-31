import React, { useRef, useEffect } from 'react';
import { useRobot } from '../../context/RobotContext';
import { useLanguage } from '../../context/LanguageContext';

export const ControlPanel: React.FC = () => {
  const { robotState, updateJointValue, resetJoints } = useRobot();
  const { t } = useLanguage();
  const pendingUpdatesRef = useRef<Map<string, number>>(new Map());
  const animationFrameRef = useRef<number | null>(null);

  const flushUpdates = () => {
    if (pendingUpdatesRef.current.size > 0) {
      pendingUpdatesRef.current.forEach((value, jointName) => {
        updateJointValue(jointName, value);
      });
      pendingUpdatesRef.current.clear();
    }
    animationFrameRef.current = null;
  };

  const scheduleUpdate = (jointName: string, value: number) => {
    pendingUpdatesRef.current.set(jointName, value);
    
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(flushUpdates);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!robotState) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t.controlPanel.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t.controlPanel.loadURDF}</p>
      </div>
    );
  }

  const movableJoints = robotState.joints.filter(j => 
    j.type === 'revolute' || j.type === 'prismatic' || j.type === 'continuous'
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t.controlPanel.title}</h3>
        <button
          onClick={resetJoints}
          className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {t.controlPanel.resetJoints}
        </button>
      </div>

      {movableJoints.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">{t.controlPanel.noMovableJoints}</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {movableJoints.map(joint => {
            const currentValue = robotState.jointValues.get(joint.name) || 0;
            const min = joint.limit?.lower ?? (joint.type === 'continuous' ? -Math.PI : 0);
            const max = joint.limit?.upper ?? (joint.type === 'continuous' ? Math.PI : 0);
            
            return (
              <div key={joint.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {joint.name}
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {currentValue.toFixed(3)} {joint.type === 'prismatic' ? 'm' : 'rad'}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={0.01}
                  value={currentValue}
                  onChange={(e) => scheduleUpdate(joint.name, parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                  <span>{min.toFixed(2)}</span>
                  <span>{max.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
