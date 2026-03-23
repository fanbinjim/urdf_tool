import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { URDFLink as URDFLinkType, URDFJoint } from '../../types';

interface RobotModelProps {
  robotState: {
    jointValues: Map<string, number>;
    links: URDFLinkType[];
    joints: URDFJoint[];
    rootLink: string;
  };
}

const createGeometry = (geometry: any): THREE.BufferGeometry => {
  if (geometry.box) {
    const { size } = geometry.box;
    return new THREE.BoxGeometry(size.x, size.y, size.z);
  }
  
  if (geometry.cylinder) {
    const { radius, length } = geometry.cylinder;
    return new THREE.CylinderGeometry(radius, radius, length, 32);
  }
  
  if (geometry.sphere) {
    const { radius } = geometry.sphere;
    return new THREE.SphereGeometry(radius, 32, 32);
  }
  
  return new THREE.BoxGeometry(0.1, 0.1, 0.1);
};

const createMaterial = (material?: any): THREE.Material => {
  if (material?.color) {
    const [r, g, b, a] = material.color.rgba;
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(r, g, b),
      transparent: a < 1,
      opacity: a,
    });
  }
  
  return new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.3,
    roughness: 0.7,
  });
};

const LinkVisual: React.FC<{ visual: any; linkName: string; idx: number }> = ({ visual }) => {
  const geometry = useMemo(() => createGeometry(visual.geometry), [visual.geometry]);
  const material = useMemo(() => createMaterial(visual.material), [visual.material]);
  
  const urdfPos = visual.origin?.xyz || { x: 0, y: 0, z: 0 };
  const urdfRot = visual.origin?.rpy || { x: 0, y: 0, z: 0 };
  
  const threePos = {
    x: -urdfPos.y,
    y: urdfPos.z,
    z: -urdfPos.x
  };
  
  const threeRot = {
    x: -urdfRot.y,
    y: urdfRot.z,
    z: -urdfRot.x
  };
  
  return (
    <group 
      key={`visual-${JSON.stringify(visual.origin)}`}
      position={[threePos.x, threePos.y, threePos.z]} 
      rotation={[threeRot.x, threeRot.y, threeRot.z]}
    >
      <mesh geometry={geometry} material={material} />
    </group>
  );
};

const JointGroup: React.FC<{ 
  joint: URDFJoint;
  jointValues: Map<string, number>;
  children: React.ReactNode;
}> = ({ joint, jointValues, children }) => {
  const urdfPos = joint.origin?.xyz || { x: 0, y: 0, z: 0 };
  const urdfRot = joint.origin?.rpy || { x: 0, y: 0, z: 0 };
  
  const jointValue = jointValues.get(joint.name) || 0;
  
  const threePos = {
    x: -urdfPos.y,
    y: urdfPos.z,
    z: -urdfPos.x
  };
  
  const threeRot = {
    x: -urdfRot.y,
    y: urdfRot.z,
    z: -urdfRot.x
  };
  
  const jointAxis = joint.axis || { x: 0, y: 0, z: 1 };
  const threeAxis = {
    x: -jointAxis.y,
    y: jointAxis.z,
    z: -jointAxis.x
  };
  
  return (
    <group 
      key={`joint-${joint.name}-${JSON.stringify(joint.origin)}-${jointValue}`}
      position={[threePos.x, threePos.y, threePos.z]} 
      rotation={[threeRot.x, threeRot.y, threeRot.z]}
    >
      {joint.type === 'revolute' || joint.type === 'continuous' || joint.type === 'prismatic' ? (
        <group rotation={[threeAxis.x * jointValue, threeAxis.y * jointValue, threeAxis.z * jointValue]}>
          {children}
        </group>
      ) : (
        children
      )}
    </group>
  );
};

export const RobotModel: React.FC<RobotModelProps> = ({ robotState }) => {
  const linkMap = useMemo(() => {
    const map = new Map<string, URDFLinkType>();
    robotState.links.forEach(link => {
      map.set(link.name, link);
    });
    return map;
  }, [robotState.links]);

  const renderLink = (linkName: string): React.ReactNode => {
    const link = linkMap.get(linkName);
    if (!link) return null;

    const childJoints = robotState.joints.filter(j => j.parent === linkName);
    
    return (
      <group key={linkName}>
        {link.visual?.map((visual, idx) => (
          <LinkVisual key={`${linkName}-visual-${idx}`} visual={visual} linkName={linkName} idx={idx} />
        ))}
        
        {childJoints.map(joint => (
          <JointGroup key={joint.name} joint={joint} jointValues={robotState.jointValues}>
            {renderLink(joint.child)}
          </JointGroup>
        ))}
      </group>
    );
  };

  if (!robotState.rootLink) {
    return null;
  }

  return (
    <group key={`robot-${robotState.links.length}-${robotState.joints.length}-${Array.from(robotState.jointValues.entries()).join('-')}`}>
      {renderLink(robotState.rootLink)}
    </group>
  );
};