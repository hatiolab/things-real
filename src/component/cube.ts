/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from "./component";

import RealObjectMesh from "./threed/real-object-mesh";
import * as THREE from "three";

class ObjectCube extends RealObjectMesh {
  buildGeometry() {
    var { width = 1, height = 1, depth = 1 } =
      this.component.state.dimension || Component.UNIT_DIMENSION;

    return new THREE.CubeGeometry(width, height, depth);
  }
}

export default class Cube extends Component {
  static get type() {
    return ["cube", "box"];
  }

  buildObject3D() {
    return new ObjectCube(this);
  }
}

Component.register(Cube.type, Cube);
