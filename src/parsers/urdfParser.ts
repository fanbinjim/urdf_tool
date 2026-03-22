import type { URDFLink, URDFJoint, Pose } from '../types';

export class URDFParser {
  private xmlDocument: Document;

  constructor(xmlString: string) {
    const parser = new DOMParser();
    this.xmlDocument = parser.parseFromString(xmlString, 'text/xml');
  }

  parse(): { links: URDFLink[]; joints: URDFJoint[]; rootLink: string } {
    const robotElement = this.xmlDocument.querySelector('robot');
    if (!robotElement) {
      throw new Error('No robot element found in URDF');
    }

    const links = this.parseLinks(robotElement);
    const joints = this.parseJoints(robotElement);
    const rootLink = this.findRootLink(links, joints);

    return { links, joints, rootLink };
  }

  private parseLinks(robotElement: Element): URDFLink[] {
    const linkElements = robotElement.querySelectorAll('link');
    const links: URDFLink[] = [];

    linkElements.forEach(linkElement => {
      const link: URDFLink = {
        name: linkElement.getAttribute('name') || '',
      };

      const inertialElement = linkElement.querySelector('inertial');
      if (inertialElement) {
        link.inertial = this.parseInertial(inertialElement);
      }

      const visualElements = linkElement.querySelectorAll('visual');
      if (visualElements.length > 0) {
        link.visual = Array.from(visualElements).map(visualElement =>
          this.parseVisual(visualElement)
        );
      }

      const collisionElements = linkElement.querySelectorAll('collision');
      if (collisionElements.length > 0) {
        link.collision = Array.from(collisionElements).map(collisionElement =>
          this.parseCollision(collisionElement)
        );
      }

      links.push(link);
    });

    return links;
  }

  private parseInertial(inertialElement: Element) {
    const inertial: any = {};

    const originElement = inertialElement.querySelector('origin');
    if (originElement) {
      inertial.origin = this.parsePose(originElement);
    }

    const massElement = inertialElement.querySelector('mass');
    if (massElement) {
      inertial.mass = parseFloat(massElement.getAttribute('value') || '0');
    }

    const inertiaElement = inertialElement.querySelector('inertia');
    if (inertiaElement) {
      inertial.inertia = {
        ixx: parseFloat(inertiaElement.getAttribute('ixx') || '0'),
        ixy: parseFloat(inertiaElement.getAttribute('ixy') || '0'),
        ixz: parseFloat(inertiaElement.getAttribute('ixz') || '0'),
        iyy: parseFloat(inertiaElement.getAttribute('iyy') || '0'),
        iyz: parseFloat(inertiaElement.getAttribute('iyz') || '0'),
        izz: parseFloat(inertiaElement.getAttribute('izz') || '0'),
      };
    }

    return inertial;
  }

  private parseVisual(visualElement: Element) {
    const visual: any = {
      name: visualElement.getAttribute('name'),
    };

    const originElement = visualElement.querySelector('origin');
    if (originElement) {
      visual.origin = this.parsePose(originElement);
    }

    const geometryElement = visualElement.querySelector('geometry');
    if (geometryElement) {
      visual.geometry = this.parseGeometry(geometryElement);
    }

    const materialElement = visualElement.querySelector('material');
    if (materialElement) {
      visual.material = this.parseMaterial(materialElement);
    }

    return visual;
  }

  private parseCollision(collisionElement: Element) {
    const collision: any = {
      name: collisionElement.getAttribute('name'),
    };

    const originElement = collisionElement.querySelector('origin');
    if (originElement) {
      collision.origin = this.parsePose(originElement);
    }

    const geometryElement = collisionElement.querySelector('geometry');
    if (geometryElement) {
      collision.geometry = this.parseGeometry(geometryElement);
    }

    return collision;
  }

  private parsePose(originElement: Element): Pose {
    const pose: Pose = {};

    const xyz = originElement.getAttribute('xyz');
    if (xyz) {
      const [x, y, z] = xyz.split(' ').map(parseFloat);
      pose.xyz = { x, y, z };
    }

    const rpy = originElement.getAttribute('rpy');
    if (rpy) {
      const [x, y, z] = rpy.split(' ').map(parseFloat);
      pose.rpy = { x, y, z };
    }

    return pose;
  }

  private parseGeometry(geometryElement: Element) {
    const geometry: any = {};

    const boxElement = geometryElement.querySelector('box');
    if (boxElement) {
      const size = boxElement.getAttribute('size');
      if (size) {
        const [x, y, z] = size.split(' ').map(parseFloat);
        geometry.box = { size: { x, y, z } };
      }
    }

    const cylinderElement = geometryElement.querySelector('cylinder');
    if (cylinderElement) {
      geometry.cylinder = {
        radius: parseFloat(cylinderElement.getAttribute('radius') || '0'),
        length: parseFloat(cylinderElement.getAttribute('length') || '0'),
      };
    }

    const sphereElement = geometryElement.querySelector('sphere');
    if (sphereElement) {
      geometry.sphere = {
        radius: parseFloat(sphereElement.getAttribute('radius') || '0'),
      };
    }

    const meshElement = geometryElement.querySelector('mesh');
    if (meshElement) {
      geometry.mesh = {
        filename: meshElement.getAttribute('filename') || '',
      };

      const scale = meshElement.getAttribute('scale');
      if (scale) {
        const [x, y, z] = scale.split(' ').map(parseFloat);
        geometry.mesh.scale = { x, y, z };
      }
    }

    return geometry;
  }

  private parseMaterial(materialElement: Element) {
    const material: any = {
      name: materialElement.getAttribute('name'),
    };

    const colorElement = materialElement.querySelector('color');
    if (colorElement) {
      const rgba = colorElement.getAttribute('rgba');
      if (rgba) {
        material.color = {
          rgba: rgba.split(' ').map(parseFloat) as [number, number, number, number],
        };
      }
    }

    const textureElement = materialElement.querySelector('texture');
    if (textureElement) {
      material.texture = {
        filename: textureElement.getAttribute('filename') || '',
      };
    }

    return material;
  }

  private parseJoints(robotElement: Element): URDFJoint[] {
    const jointElements = robotElement.querySelectorAll('joint');
    const joints: URDFJoint[] = [];

    jointElements.forEach(jointElement => {
      const joint: URDFJoint = {
        name: jointElement.getAttribute('name') || '',
        type: jointElement.getAttribute('type') as URDFJoint['type'],
        parent: jointElement.querySelector('parent')?.getAttribute('link') || '',
        child: jointElement.querySelector('child')?.getAttribute('link') || '',
      };

      const originElement = jointElement.querySelector('origin');
      if (originElement) {
        joint.origin = this.parsePose(originElement);
      }

      const axisElement = jointElement.querySelector('axis');
      if (axisElement) {
        const xyz = axisElement.getAttribute('xyz');
        if (xyz) {
          const [x, y, z] = xyz.split(' ').map(parseFloat);
          joint.axis = { x, y, z };
        }
      }

      const limitElement = jointElement.querySelector('limit');
      if (limitElement) {
        joint.limit = {
          lower: parseFloat(limitElement.getAttribute('lower') || '0'),
          upper: parseFloat(limitElement.getAttribute('upper') || '0'),
          effort: parseFloat(limitElement.getAttribute('effort') || '0'),
          velocity: parseFloat(limitElement.getAttribute('velocity') || '0'),
        };
      }

      const dynamicsElement = jointElement.querySelector('dynamics');
      if (dynamicsElement) {
        joint.dynamics = {
          damping: parseFloat(dynamicsElement.getAttribute('damping') || '0'),
          friction: parseFloat(dynamicsElement.getAttribute('friction') || '0'),
        };
      }

      joints.push(joint);
    });

    return joints;
  }

  private findRootLink(links: URDFLink[], joints: URDFJoint[]): string {
    const childLinks = new Set(joints.map(j => j.child));
    for (const link of links) {
      if (!childLinks.has(link.name)) {
        return link.name;
      }
    }
    return links[0]?.name || '';
  }
}
