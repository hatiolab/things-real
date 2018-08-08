/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import RealObject from './real-object'

import * as THREE from 'three'

export default abstract class RealObjectMesh extends THREE.Mesh implements RealObject {
  protected _component

  constructor(component) {
    super()

    this.component = component
  }

  get isRealObject() {
    return true
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

  update() {
    this.clear()
    this.build()
  }

  protected abstract buildGeometry(): THREE.Geometry | THREE.BufferGeometry

  buildMaterial(): THREE.MeshMaterialType | THREE.MeshMaterialType[] {

    var {
      color = 0x000000
    } = this.component.state

    return new THREE.MeshBasicMaterial({ color })
  }

  clear() {
    this.traverse((mesh: any) => {
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        (mesh.material.length ? mesh.material : [mesh.material])
          .forEach(m => m.dispose && m.dispose())
      }
    })
  }
}
