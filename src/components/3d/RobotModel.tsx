import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { URDFLink as URDFLinkType, URDFJoint, Pose } from '../../types';

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

const LinkVisual: React.FC<{ visual: any; linkName: string; idx: number }> = ({ visual, linkName, idx }) => {
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
    <group position={[threePos.x, threePos.y, threePos.z]} rotation={[threeRot.x, threeRot.y, threeRot.z]}>
      <mesh geometry={geometry} material={material} />
    </group>
  );
};

const JointGroup: React.FC<{ 
  joint: URDFJoint;
  children: React.ReactNode;
}> = ({ joint, children }) => {
  const urdfPos = joint.origin?.xyz || { x: 0, y: 0, z: 0 };
  const urdfRot = joint.origin?.rpy || { x: 0, y: 0, z: 0 };
  
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
  
  return <group position={[threePos.x, threePos.y, threePos.z]} rotation={[threeRot.x, threeRot.y, threeRot.z]}>{children}</group>;
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
          <JointGroup key={joint.name} joint={joint}>
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
    <group>
      {renderLink(robotState.rootLink)}
    </group>
  );
};