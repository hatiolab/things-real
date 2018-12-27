/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import RealObject from "./real-object";
import Component from "../component";

import * as THREE from "three";

import { createCamera, updateCamera } from "../camera/camera";
import { applyAlpha } from "./common";
import { error } from "../../util/logger";

export default abstract class RealObjectMesh extends THREE.Mesh
  implements RealObject {
  protected _component;

  constructor(component) {
    super();

    this.component = component;
  }

  get isRealObject() {
    return true;
  }

  build() {
    this.geometry = this.buildGeometry();
    this.material = this.buildMaterial();
  }

  dispose() {
    this.clear();
  }

  get component() {
    return this._component;
  }

  set component(component) {
    this.clear();

    this._component = component;

    this.update();
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

  update() {
    this.clear();
    this.build();

    this.updateTransform();
    this.updateAlpha();
    this.updateHidden();
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
    this.scale.set(sx, sy, sz);
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
    this.scale.set(x, y, z);
  }

  /* overide */
  updateDimension() {
    this.update();
  }

  updateAlpha() {
    var { alpha = 1, fillStyle } = this.component.state;

    applyAlpha(this.material, alpha, fillStyle);
  }

  updateHidden() {
    this.visible = !this.component.state.hidden;
  }

  updateCamera() {
    updateCamera(this.camera, this.component.state.camera);
  }

  protected abstract buildGeometry(): THREE.Geometry | THREE.BufferGeometry;

  buildMaterial(): THREE.Material /* : THREE.MeshMaterialType | THREE.MeshMaterialType[] */ {
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

  clear() {
    this.traverse((mesh: any) => {
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        (mesh.material.length ? mesh.material : [mesh.material]).forEach(
          m => m.dispose && m.dispose()
        );
      }
    });
  }
}
