import React, { useState, useMemo, useEffect } from 'react';
import { useRobot } from '../../context/RobotContext';
import type { URDFLink, URDFJoint } from '../../types';

interface TreeNodeProps {
  link: URDFLink;
  joints: URDFJoint[];
  links: URDFLink[];
  level: number;
  selectedItem: string | null;
  onSelect: (name: string) => void;
  expandedItems: Set<string>;
  onToggleExpand: (name: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  link,
  joints,
  links,
  level,
  selectedItem,
  onSelect,
  expandedItems,
  onToggleExpand,
}) => {
  const childJoints = useMemo(
    () => joints.filter(j => j.parent === link.name),
    [joints, link.name]
  );

  const hasChildren = childJoints.length > 0;
  const isExpanded = expandedItems.has(link.name);

  const childLinks = useMemo(() => {
    const linkMap = new Map(links.map(l => [l.name, l]));
    return childJoints.map(j => linkMap.get(j.child)).filter(Boolean) as URDFLink[];
  }, [childJoints, links]);

  return (
    <div>
      {/* Link节点 */}
      <div
        className="flex items-center"
        style={{ paddingLeft: `${level * 16}px` }}
      >
        {hasChildren && (
          <button
            onClick={() => onToggleExpand(link.name)}
            className="mr-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-400"
          >
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {!hasChildren && <span className="w-4 mr-1" />}
        <button
          onClick={() => onSelect(link.name)}
          className={`flex-1 text-left px-2 py-1 rounded text-xs transition-colors ${
            selectedItem === link.name
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <span className="mr-1">📦</span>
          {link.name}
        </button>
      </div>

      {/* 子Joint和Link */}
      {isExpanded && childJoints.map(joint => (
        <div key={joint.name}>
          {/* Joint节点 */}
          <div
            className="flex items-center"
            style={{ paddingLeft: `${(level + 1) * 16}px` }}
          >
            <span className="w-4 mr-1" />
            <button
              onClick={() => onSelect(joint.name)}
              className={`flex-1 text-left px-2 py-1 rounded text-xs transition-colors ${
                selectedItem === joint.name
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="mr-1">🔗</span>
              {joint.name}
              <span className="ml-1 text-gray-400">({joint.type})</span>
            </button>
          </div>

          {/* 子Link */}
          {childLinks
            .filter(childLink => childLink.name === joint.child)
            .map(childLink => (
              <TreeNode
                key={childLink.name}
                link={childLink}
                joints={joints}
                links={links}
                level={level + 2}
                selectedItem={selectedItem}
                onSelect={onSelect}
                expandedItems={expandedItems}
                onToggleExpand={onToggleExpand}
              />
            ))}
        </div>
      ))}
    </div>
  );
};

export const InfoPanel: React.FC = () => {
  const { robotState } = useRobot();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // URDF加载完成后，默认展开所有节点
  useEffect(() => {
    if (robotState) {
      setExpandedItems(new Set(robotState.links.map(l => l.name)));
    }
  }, [robotState]);

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (robotState) {
      setExpandedItems(new Set(robotState.links.map(l => l.name)));
    }
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  if (!robotState) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Robot Info</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Load a URDF file to see robot info</p>
      </div>
    );
  }

  const selectedLink = robotState.links.find(l => l.name === selectedItem);
  const selectedJoint = robotState.joints.find(j => j.name === selectedItem);

  const rootLink = robotState.links.find(l => l.name === robotState.rootLink);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Robot Info</h3>
      
      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 mb-4">
        <div className="flex justify-between">
          <span>Links:</span>
          <span className="font-medium text-gray-900 dark:text-white">{robotState.links.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Joints:</span>
          <span className="font-medium text-gray-900 dark:text-white">{robotState.joints.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Root Link:</span>
          <span className="font-medium text-gray-900 dark:text-white">{robotState.rootLink}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Structure</h4>
          <div className="flex gap-1">
            <button
              onClick={expandAll}
              className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
            >
              展开
            </button>
            <button
              onClick={collapseAll}
              className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
            >
              收缩
            </button>
          </div>
        </div>
        <div className="space-y-0.5 max-h-64 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded p-2">
          {rootLink && (
            <TreeNode
              link={rootLink}
              joints={robotState.joints}
              links={robotState.links}
              level={0}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              expandedItems={expandedItems}
              onToggleExpand={toggleExpand}
            />
          )}
        </div>
      </div>

      {selectedItem && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Details</h4>
          
          {selectedLink && (
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Name:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{selectedLink.name}</span>
              </div>
              {selectedLink.inertial && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Mass:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {selectedLink.inertial.mass?.toFixed(3)} kg
                  </span>
                </div>
              )}
              {selectedLink.visual && selectedLink.visual.length > 0 && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Visuals:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{selectedLink.visual.length}</span>
                </div>
              )}
            </div>
          )}

          {selectedJoint && (
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Name:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{selectedJoint.name}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{selectedJoint.type}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Parent:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{selectedJoint.parent}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Child:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{selectedJoint.child}</span>
              </div>
              {selectedJoint.limit && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Range:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    [{selectedJoint.limit.lower?.toFixed(2)}, {selectedJoint.limit.upper?.toFixed(2)}]
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
