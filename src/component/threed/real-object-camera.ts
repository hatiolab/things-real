/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from "../component";
import RealObject from "./real-object";

import * as THREE from "three";

import { SCALE_MIN } from "./common";
// import { updateCamera } from "../camera/camera";

import { error } from "../../util/logger";

const DEFAULT = {
  far: 100000,
  fov: 80,
  near: 1,
  zoom: 1
};

export default class RealObjectCamera extends THREE.PerspectiveCamera
  implements RealObject {
  protected _component: Component;

  constructor(component) {
    super();

    this.component = component;
  }

  initialize() {}

  dispose() {
    this.clear();
  }

  get isRealObject() {
    return true;
  }

  get component() {
    return this._component;
  }

  set component(component) {
    this.clear();

    this._component = component;

    this.update();
  }

  update() {
    this.clear();
    this.build();

    this.updateTransform();
    this.updateAlpha();
    this.updateHidden();
    this.updateCamera();
  }

  /**
   * Component의 상태값의 변화를 Object3D에 반영 - translate, rotation, scale
   */
  updateTransform() {
    var {
      scale: { x: sx = 1, y: sy = 1, z: sz = 1 } = Component.UNIT_SCALE,
      translate: { x: tx = 0, y: ty = 0, z: tz = 0 } = Component.UNIT_TRANSLATE,
      rotate: { x: rx = 0, y: ry = 0, z: rz = 0 } = Component.UNIT_ROTATE
    } = this.component.state;

    this.position.set(tx, ty, tz);
    this.rotation.set(rx, ry, rz);
    this.scale.set(
      Math.max(sx, SCALE_MIN),
      Math.max(sy, SCALE_MIN),
      Math.max(sz, SCALE_MIN)
    );
  }

  /**
   * Object3D 모델의 변화를 Component의 모델값에 반영
   */
  updateTransformReverse() {
    var rotation = this.rotation;
    var position = this.position;
    var scale = this.scale;

    this.component.setModel({
      rotate: {
        x: rotation.x,
        y: rotation.y,
        z: rotation.z
      },
      translate: {
        x: position.x,
        y: position.y,
        z: position.z
      },
      scale: {
        x: scale.x,
        y: scale.y,
        z: scale.z
      }
    });
  }

  /* update functions - 전체적인 rebuilding이 필요하지 않은 update 기능 들임 */
  updateTranslate() {
    var { x = 0, y = 0, z = 0 } = this.component.state.translate;
    this.position.set(x, y, z);
  }

  updateRotate() {
    var { x = 0, y = 0, z = 0 } = this.component.state.rotate;
    this.rotation.set(x, y, z);
  }

  updateScale() {
    var { x = 1, y = 1, z = 1 } = this.component.state.scale;
    this.scale.set(
      Math.max(x, SCALE_MIN),
      Math.max(y, SCALE_MIN),
      Math.max(z, SCALE_MIN)
    );
  }

  updateDimension() {
    this.update();
  }

  updateAlpha() {}

  updateHidden() {
    this.visible = !this.component.state.hidden;
  }

  updateCamera() {
    var {
      near = DEFAULT.near,
      far = DEFAULT.far,
      fov = DEFAULT.fov,
      zoom = DEFAULT.zoom
    } = this.component.state;

    this.far = far;
    this.fov = fov;
    this.near = near;
    this.zoom = zoom;
  }

  build() {
    this.add(new THREE.Mesh(this.buildGeometry(), this.buildMaterial()));
  }

  buildMaterial() {
    var { fillStyle } = this.component.state;

    var params: any = {};

    if (typeof fillStyle == "object") {
      params = {
        map: new THREE.TextureLoader(THREE.DefaultLoadingManager).load(
          fillStyle.image,
          () => {
            this.component.invalidate();
          },
          e => {
            error(e);
          }
        )
      };
    } else {
      params = {
        color: fillStyle || "#FFF"
      };
    }

    const material = new THREE.MeshLambertMaterial(params);

    return material;
  }

  buildGeometry() {
    var { width = 1, height = 1, depth = 1 } =
      this.component.state.dimension || Component.UNIT_DIMENSION;

    var radius = Math.min(width, height, depth) / 2;

    return new THREE.SphereGeometry(radius, 32, 32);
  }

  clear() {
    this.children.slice().forEach(child => {
      if (child["dispose"]) child["dispose"]();
      if (child["geometry"] && child["geometry"]["dispose"])
        child["geometry"]["dispose"]();
      if (child["material"] && child["material"]["dispose"])
        child["material"]["dispose"]();
      if (child["texture"] && child["texture"]["dispose"])
        child["texture"]["dispose"]();
      this.remove(child);
    });
  }
}
