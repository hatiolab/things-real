/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import AbstractRealObject from "./abstract-real-object";
import * as THREE from "three";

export default class RealObjectCamera extends AbstractRealObject {
  private camera: THREE.PerspectiveCamera;

  build() {
    this.camera = new THREE.PerspectiveCamera();
  }

  update() {
    var { far, fov, near, zoom, aspect } = this.component.state;

    // Update properties.
    this.camera.aspect = aspect || window.innerWidth / window.innerHeight;
    this.camera.far = far;
    this.camera.fov = fov;
    this.camera.near = near;
    this.camera.zoom = zoom;

    this.camera.updateProjectionMatrix();
  }
}
