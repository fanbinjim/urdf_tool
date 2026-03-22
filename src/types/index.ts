export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Pose {
  xyz?: Vector3;
  rpy?: Vector3;
}

export interface Inertial {
  origin?: Pose;
  mass?: number;
  inertia?: {
    ixx?: number;
    ixy?: number;
    ixz?: number;
    iyy?: number;
    iyz?: number;
    izz?: number;
  };
}

export interface Geometry {
  box?: {
    size: Vector3;
  };
  cylinder?: {
    radius: number;
    length: number;
  };
  sphere?: {
    radius: number;
  };
  mesh?: {
    filename: string;
    scale?: Vector3;
  };
}

export interface Material {
  name?: string;
  color?: {
    rgba: [number, number, number, number];
  };
  texture?: {
    filename: string;
  };
}

export interface Visual {
  name?: string;
  origin?: Pose;
  geometry: Geometry;
  material?: Material;
}

export interface Collision {
  name?: string;
  origin?: Pose;
  geometry: Geometry;
}

export interface URDFLink {
  name: string;
  inertial?: Inertial;
  visual?: Visual[];
  collision?: Collision[];
}

export interface JointLimit {
  lower?: number;
  upper?: number;
  effort?: number;
  velocity?: number;
}

export interface JointDynamics {
  damping?: number;
  friction?: number;
}

export interface URDFJoint {
  name: string;
  type: 'revolute' | 'prismatic' | 'continuous' | 'fixed' | 'floating' | 'planar';
  parent: string;
  child: string;
  origin?: Pose;
  axis?: Vector3;
  limit?: JointLimit;
  dynamics?: JointDynamics;
  calibration?: {
    rising?: number;
    falling?: number;
  };
  safety_controller?: {
    soft_lower_limit?: number;
    soft_upper_limit?: number;
    k_position?: number;
    k_velocity?: number;
  };
  mimic?: {
    joint: string;
    multiplier?: number;
    offset?: number;
  };
}

export interface RobotState {
  jointValues: Map<string, number>;
  links: URDFLink[];
  joints: URDFJoint[];
  rootLink: string;
}

export interface RobotConfig {
  name: string;
  links: URDFLink[];
  joints: URDFJoint[];
  rootLink: string;
}

export interface JointState {
  name: string;
  value: number;
  min?: number;
  max?: number;
  velocity?: number;
  effort?: number;
}

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

export interface CameraTarget {
  x: number;
  y: number;
  z: number;
}

export interface ViewMode {
  type: 'front' | 'side' | 'top' | 'isometric' | 'custom';
  position?: CameraPosition;
  target?: CameraTarget;
}

export interface SceneConfig {
  showGrid: boolean;
  showAxes: boolean;
  showCoordinateFrames: boolean;
  backgroundColor: string;
  gridColor: string;
  gridSize: number;
  gridDivisions: number;
}

export type InputMode = 'file' | 'text';

export interface URDFInput {
  mode: InputMode;
  content: string;
  files?: File[];
  fileName?: string;
}

export interface ValidationError {
  line?: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ParseResult {
  success: boolean;
  errors?: ValidationError[];
  warnings?: ValidationError[];
}
