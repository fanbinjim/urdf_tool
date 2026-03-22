import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';
import { RobotModel } from './RobotModel';

interface RobotSceneProps {
  robotState: any;
}

const AxisLabel: React.FC<{ position: [number, number, number]; label: string; color: string }> = ({ position, label, color }) => {
  return (
    <Text
      position={position}
      fontSize={0.3}
      color={color}
      anchorX="center"
      anchorY="middle"
    >
      {label}
    </Text>
  );
};

const CoordinateAxes: React.FC = () => {
  return (
    <group>
      {/* URDF坐标系: X向前(红色), Y向左(绿色), Z向上(蓝色) */}
      {/* Three.js坐标: X向右, Y向上, Z向后(观察者方向) */}
      {/* 转换: URDF X → Three.js -Z, URDF Y → Three.js -X, URDF Z → Three.js Y */}
      
      {/* X轴 (URDF向前) - 在Three.js中是 -Z 方向 */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, 0, -3])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff0000" linewidth={2} />
      </line>
      <AxisLabel position={[0, 0, -3.2]} label="X" color="#ff0000" />
      
      {/* Y轴 (URDF向左) - 在Three.js中是 -X 方向 */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, -3, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00ff00" linewidth={2} />
      </line>
      <AxisLabel position={[-3.2, 0, 0]} label="Y" color="#00ff00" />
      
      {/* Z轴 (URDF向上) - 在Three.js中是 Y 方向 */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, 3, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#0000ff" linewidth={2} />
      </line>
      <AxisLabel position={[0, 3.2, 0]} label="Z" color="#0000ff" />
    </group>
  );
};

export const RobotScene: React.FC<RobotSceneProps> = ({ robotState }) => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [-8, 8, -8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[15, 20, 10]} intensity={1.2} />
          <pointLight position={[-15, -10, -5]} intensity={0.4} />
          
          <Grid
            args={[30, 30]}
            cellSize={1}
            cellThickness={0.3}
            cellColor="#888888"
            sectionSize={5}
            sectionThickness={0.6}
            sectionColor="#aa3bff"
            fadeDistance={50}
            fadeStrength={0.8}
            followCamera={false}
            infiniteGrid
          />
          
          <CoordinateAxes />
          
          {robotState && <RobotModel robotState={robotState} />}
          
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.03}
            minDistance={2}
            maxDistance={100}
            autoRotate={false}
            autoRotateSpeed={2.0}
          />
        </Suspense>
      </Canvas>
      
      {!robotState && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="text-center text-white">
            <svg className="w-16 h-16 mx-auto mb-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">URDF Viewer</h3>
            <p className="text-gray-300">上传URDF文件或粘贴URDF内容开始</p>
          </div>
        </div>
      )}
    </div>
  );
};
