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

  protected abstract buildGeometry(): THREE.Geometry | THREE.BufferGeometry
  protected abstract buildMaterial(): THREE.MeshMaterialType | THREE.MeshMaterialType[]

  clear() {
    if (this.geometry) {
      this.geometry.dispose()
    }
    if (this.material && this.material['dispose']) {
      this.material['dispose']()
    }
  }
}
