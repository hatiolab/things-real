/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as THREE from 'three'
import RealObject3D from './real-object-3d'

export default abstract class RealObjectMesh extends THREE.Mesh implements RealObject3D {
  protected _component

  constructor(component) {
    super();

    this.component = component;

    var {
      scale: {
        x: sx = 1,
        y: sy = 1,
        z: sz = 1
      } = { x: 1, y: 1, z: 1 },
      translate: {
        x: tx = 0,
        y: ty = 0,
        z: tz = 0
      } = { x: 0, y: 0, z: 0 },
      rotate: {
        x: rx = 0,
        y: ry = 0,
        z: rz = 0
      } = { x: 0, y: 0, z: 0 }
    } = component.state

    this.position.set(tx, ty, tz);
    this.rotation.set(rx, ry, rz);
    this.scale.set(sx, sy, sz);
  }

  build() {
    this.geometry = this.buildGeometry()
    this.material = this.buildMaterial()
  }

  dispose() {
    this.clear();
  }

  get component() {
    return this._component
  }

  set component(component) {
    this.clear()
    this._component = component
    this.build()
  }

  public abstract setDimension(dimension)
  protected abstract buildGeometry(): THREE.Geometry | THREE.BufferGeometry

  buildMaterial(): THREE.MeshMaterialType | THREE.MeshMaterialType[] {

    var {
      color = 0x000000
    } = this.component.state

    return new THREE.MeshBasicMaterial({ color })
  }

  clear() {
    if (this.geometry) {
      this.geometry.dispose()
    }
    if (this.material && this.material['dispose']) {
      this.material['dispose']()
    }
  }
}
