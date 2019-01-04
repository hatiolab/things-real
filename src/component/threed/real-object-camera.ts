/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from "../component";
import RealObjectMesh from "./real-object-mesh";

import * as THREE from "three";

const DEFAULT = {
  far: 100000,
  fov: 80,
  near: 1,
  zoom: 1
};

export default class RealObjectCamera extends RealObjectMesh {
  protected _camera: THREE.PerspectiveCamera;

  update() {
    super.update();

    this.updateCamera();
  }

  get camera(): THREE.PerspectiveCamera {
    if (!this._camera) {
      this._camera = this.createCamera();
      this.updateCamera();
    }

    return this._camera;
  }

  createCamera() {
    return new THREE.PerspectiveCamera();
  }

  updateCamera() {
    var {
      near = DEFAULT.near,
      far = DEFAULT.far,
      fov = DEFAULT.fov,
      zoom = DEFAULT.zoom
    } = this.component.state;

    this.camera.far = far;
    this.camera.fov = fov;
    this.camera.near = near;
    this.camera.zoom = zoom;
  }

  build() {
    super.build();

    this.add(this.camera);
  }

  clear() {
    super.clear();

    delete this._camera;
  }

  buildGeometry() {
    var { width = 1, height = 1, depth = 1 } =
      this.component.state.dimension || Component.UNIT_DIMENSION;

    var radius = Math.min(width, height, depth) / 2;

    return new THREE.SphereGeometry(radius, 32, 32);
  }
}
