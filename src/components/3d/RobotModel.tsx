import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { useRobot } from '../../context/RobotContext';
import type { URDFLink as URDFLinkType, URDFJoint } from '../../types';

interface RobotModelProps {
  robotState: {
    jointValues: Map<string, number>;
    links: URDFLinkType[];
    joints: URDFJoint[];
    rootLink: string;
  };
}

const loader = new STLLoader();

const loadSTL = (filename: string): Promise<THREE.BufferGeometry> => {
  return new Promise((resolve, reject) => {
    loader.load(
      filename,
      (geometry) => {
        const transform = new THREE.Matrix4();
        transform.makeRotationX(-Math.PI / 2).multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
        geometry.applyMatrix4(transform);
        resolve(geometry);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
};

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

const StaticLinkVisual: React.FC<{ visual: any; linkName: string; idx: number }> = React.memo(({ visual, linkName }) => {
  const { getFileByPath, getSTLGeometry, setSTLGeometry } = useRobot();
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadGeometry = async () => {
      if (visual.geometry.mesh) {
        const { filename } = visual.geometry.mesh;
        
        const cached = getSTLGeometry(filename);
        if (cached) {
          if (isMounted) {
            setGeometry(cached);
            setIsLoaded(true);
          }
          return;
        }
        
        const file = getFileByPath(filename);
        if (file) {
          const fileURL = URL.createObjectURL(file);
          try {
            const loadedGeometry = await loadSTL(fileURL);
            setSTLGeometry(filename, loadedGeometry);
            if (isMounted) {
              setGeometry(loadedGeometry);
              setIsLoaded(true);
            }
          } catch (error) {
            console.error(`Error loading STL for link ${linkName}:`, error);
          } finally {
            URL.revokeObjectURL(fileURL);
          }
        }
      } else {
        const newGeometry = createGeometry(visual.geometry);
        if (isMounted) {
          setGeometry(newGeometry);
          setIsLoaded(true);
        }
      }
    };
    
    loadGeometry();
    
    return () => {
      isMounted = false;
    };
  }, [visual.geometry, linkName, getFileByPath, getSTLGeometry, setSTLGeometry]);
  
  const material = useMemo(() => createMaterial(visual.material), [visual.material]);
  
  const position = useMemo(() => {
    const urdfPos = visual.origin?.xyz || { x: 0, y: 0, z: 0 };
    return [-urdfPos.y, urdfPos.z, -urdfPos.x] as [number, number, number];
  }, [visual.origin]);
  
  const rotation = useMemo(() => {
    const urdfRot = visual.origin?.rpy || { x: 0, y: 0, z: 0 };
    return [-urdfRot.y, urdfRot.z, -urdfRot.x] as [number, number, number];
  }, [visual.origin]);
  
  if (!isLoaded || !geometry) {
    return null;
  }
  
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} material={material} />
    </group>
  );
});

const JointGroupWithRef: React.FC<{
  joint: URDFJoint;
  jointValue: number;
  children: React.ReactNode;
}> = React.memo(({ joint, jointValue, children }) => {
  const rotationGroupRef = useRef<THREE.Group>(null);
  
  const position = useMemo(() => {
    const urdfPos = joint.origin?.xyz || { x: 0, y: 0, z: 0 };
    return [-urdfPos.y, urdfPos.z, -urdfPos.x] as [number, number, number];
  }, [joint.origin]);
  
  const rotation = useMemo(() => {
    const urdfRot = joint.origin?.rpy || { x: 0, y: 0, z: 0 };
    return [-urdfRot.y, urdfRot.z, -urdfRot.x] as [number, number, number];
  }, [joint.origin]);
  
  const axis = useMemo(() => {
    const jointAxis = joint.axis || { x: 0, y: 0, z: 1 };
    return {
      x: -jointAxis.y,
      y: jointAxis.z,
      z: -jointAxis.x
    };
  }, [joint.axis]);
  
  useEffect(() => {
    if (rotationGroupRef.current) {
      rotationGroupRef.current.rotation.set(
        axis.x * jointValue,
        axis.y * jointValue,
        axis.z * jointValue
      );
    }
  }, [jointValue, axis]);
  
  const isRotatable = joint.type === 'revolute' || joint.type === 'continuous' || joint.type === 'prismatic';
  
  return (
    <group position={position} rotation={rotation}>
      {isRotatable ? (
        <group ref={rotationGroupRef}>{children}</group>
      ) : (
        children
      )}
    </group>
  );
});

export const RobotModel: React.FC<RobotModelProps> = ({ robotState }) => {
  const linkMap = useMemo(() => {
    const map = new Map<string, URDFLinkType>();
    robotState.links.forEach(link => map.set(link.name, link));
    return map;
  }, [robotState.links]);

  const renderLink = useCallback((linkName: string): React.ReactNode => {
    const link = linkMap.get(linkName);
    if (!link) return null;

    const childJoints = robotState.joints.filter(j => j.parent === linkName);
    
    return (
      <group key={linkName}>
        {link.visual?.map((visual, idx) => (
          <StaticLinkVisual 
            key={`${linkName}-visual-${idx}`} 
            visual={visual} 
            linkName={linkName} 
            idx={idx} 
          />
        ))}
        
        {childJoints.map(joint => {
          const jointValue = robotState.jointValues.get(joint.name) || 0;
          return (
            <JointGroupWithRef 
              key={joint.name} 
              joint={joint} 
              jointValue={jointValue}
            >
              {renderLink(joint.child)}
            </JointGroupWithRef>
          );
        })}
      </group>
    );
  }, [linkMap, robotState.joints, robotState.jointValues]);

  if (!robotState.rootLink) {
    return null;
  }

  return (
    <group key="robot-root">
      {renderLink(robotState.rootLink)}
    </group>
  );
};
