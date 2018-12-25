/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from "./component";

import RealObjectMesh from "./threed/real-object-mesh";
import * as THREE from "three";

class ObjectSky extends RealObjectMesh {
  buildGeometry() {
    var { width = 10000, height = 10000, depth = 10000 } =
      this.component.state.dimension || Component.UNIT_DIMENSION;

    var radius = Math.min(width, height, depth) / 2;

    return new THREE.SphereGeometry(radius, 64, 32);
  }

  buildMaterial() {
    var material = super.buildMaterial();
    material.side = THREE.BackSide;

    return material;
  }
}

export default class Sky extends Component {
  static get type() {
    return "sky";
  }

  buildObject3D() {
    return new ObjectSky(this);
  }
}

Component.register(Sky.type, Sky);
