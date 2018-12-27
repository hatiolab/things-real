/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as THREE from "three";
import RealObject from "./real-object";

import { createCamera, updateCamera } from "../camera/camera";

import { error } from "../../util/logger";

export default class RealObjectScene extends THREE.Scene implements RealObject {
  protected _component;

  constructor(component) {
    super();

    this.component = component;

    this.update();
  }

  dispose() {
    this.children.forEach(child => {
      child["dispose"] && child["dispose"]();

      this.remove(child);
    });
  }

  clear() {
    if (this._floor) {
      this.remove(this._floor);

      if (this._floor.material instanceof Array) {
        (this._floor.material as THREE.Material[]).forEach(material =>
          material.dispose()
        );
      } else {
        this._floor.material.dispose();
      }
      this._floor.geometry.dispose();

      delete this._floor;
    }
  }

  private _camera: THREE.Camera;

  get camera() {
    if (!this._camera) {
      let { camera: options = {} } = this.component.state;
      if (options) {
        this._camera = createCamera(this, options);
      }
    }

    return this._camera;
  }

  set camera(camera) {
    if (this._camera === camera) return;
    if (this._camera) this.remove(this._camera);
    this._camera = camera;
    if (this._camera) this.add(this._camera);
  }

  private _floor: THREE.Mesh;

  get floor() {
    return this._floor;
  }

  set floor(floor) {
    var { width, height } = this.component;

    floor.scale.set(width, height, 1);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;

    floor.name = "floor";

    floor.receiveShadow = true;

    this.add(floor);

    this._floor = floor;

    this.component.invalidate();
  }

  build() {
    var { fillStyle } = this.component.state;

    if (!fillStyle || fillStyle == "none") {
      return;
    }

    var floorGeometry = new THREE.PlaneBufferGeometry();
    var side = THREE.DoubleSide;

    if (
      typeof fillStyle == "object" &&
      fillStyle.type == "pattern" &&
      fillStyle.image
    ) {
      var floorMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader(THREE.DefaultLoadingManager).load(
          fillStyle.image,
          () => {
            this.component.invalidate();
          },
          e => {
            error(e);
          }
        ),
        side
      });
    } else if (typeof fillStyle == "string") {
      var floorMaterial = new THREE.MeshBasicMaterial({
        color: fillStyle,
        side
      });
    }

    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
  }

  update() {
    this.clear();
    this.build();

    this.updateTransform();
    this.updateAlpha();
    this.updateHidden();
  }

  updateTransform() {}
  updateTransformReverse() {}
  updateDimension() {}
  updateTranslate() {}
  updateRotate() {}
  updateScale() {}
  updateAlpha() {}
  updateHidden() {}
  updateCamera() {
    updateCamera(this.camera, this.component.state.camera);
  }

  get isRealObject() {
    return true;
  }

  get component() {
    return this._component;
  }

  set component(component) {
    this._component = component;
  }

  private _animationMixer: THREE.AnimationMixer;

  get animationMixer() {
    if (!this._animationMixer) {
      this._animationMixer = new THREE.AnimationMixer(this);
    }

    return this._animationMixer;
  }
}
