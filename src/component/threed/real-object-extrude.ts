/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import AbstractRealObject from './abstract-real-object'
import Shape from '../shape'

import * as THREE from 'three'
import * as tinycolor from 'tinycolor2'

import BoundUVGenerator from '../../threed/utils/bound-uv-generator'

const EXTRUDE_OPTIONS = {
  steps: 1,
  depth: 1,
  bevelEnabled: false
}

const SIDE_EXTRUDE_OPTIONS = {
  steps: 1,
  depth: 1,
  bevelEnabled: true,
  bevelThickness: 0,
  bevelSize: 0,
  bevelSizeSegments: 5
}

export default class RealObjectExtrude extends AbstractRealObject {

  private _boundUVGenerator

  build() {
    var {
      fillStyle,
      lineStyle = {},
      alpha = 1,
      dimension
    } = this.component.state

    var {
      height: depth = 1
    } = dimension

    var {
      strokeStyle = 0x636363,
      lineWidth = 1
    } = lineStyle

    var shape = (this.component as Shape).createShape()

    var options = {
      ...EXTRUDE_OPTIONS,
      depth,
      UVGenerator: this.boundUVGenerator
    }

    this.boundUVGenerator.setShape({
      extrudedShape: shape,
      extrudedOptions: options
    })

    var geometry = this.createGeometry(shape, options)

    if (fillStyle && fillStyle != 'none') {
      var material = this.createMaterial();
      var mesh = this.createMesh(geometry, material);

      this.add(mesh)
    }

    if (strokeStyle && strokeStyle != 'transparent' && lineWidth > 0) {
      // var sideMesh = this.createSideMesh(geometry, shape, options)
      var sideMesh = this.createSideMesh(geometry, shape)

      this.add(sideMesh)
    }
  }

  get boundUVGenerator() {
    if (!this._boundUVGenerator)
      this._boundUVGenerator = new BoundUVGenerator()

    return this._boundUVGenerator
  }

  createGeometry(shape, options) {
    var geometry = new THREE.ExtrudeBufferGeometry(shape, options)
    geometry.center()

    return geometry
  }

  createMaterial() {
    var {
      fillStyle,
      alpha = 1
    } = this.component.state

    if (!fillStyle) {
      return
    }

    var material;
    if (fillStyle.type == 'pattern' && fillStyle.image) {
      var texture = this.component.renderer._textureLoader.load(this.component.renderer.app.url(fillStyle.image), texture => {
        texture.minFilter = THREE.LinearFilter
        this.component.renderer.render_threed()
      })

      material = [
        new THREE.MeshLambertMaterial({
          map: texture,
          side: THREE.DoubleSide
        }),
        new THREE.MeshLambertMaterial({
          color: fillStyle,
          side: THREE.DoubleSide
        })
      ]
    } else {
      let params: { color?} = {}

      if (fillStyle && fillStyle !== 'transparent') {
        params.color = fillStyle
      }

      material = new THREE.MeshLambertMaterial(params)
    }

    var tinyFillStyle = tinycolor(fillStyle)
    var fillAlpha = tinyFillStyle.getAlpha()

    material.opacity = alpha * fillAlpha;
    material.transparent = alpha < 1 || fillAlpha < 1

    return material;
  }

  createMesh(geometry, material) {
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = - Math.PI / 2
    mesh.rotation.y = - Math.PI
    mesh.rotation.z = - Math.PI

    return mesh
  }

  createSideMesh(geometry, shape) {
    var {
      dimension,
      lineStyle = {},
      alpha = 1
    } = this.component.state

    var {
      height: depth = 1
    } = dimension

    var {
      lineWidth = 0,
      strokeStyle = 0x000000
    } = lineStyle

    var hole = new THREE.Path()
    hole.setFromPoints(shape.getPoints())

    var sideMaterial = new THREE.MeshLambertMaterial({
      color: strokeStyle
    })

    var tinyStrokeStyle = tinycolor(strokeStyle)
    var strokeAlpha = tinyStrokeStyle.getAlpha()
    sideMaterial.opacity = alpha * strokeAlpha
    sideMaterial.transparent = alpha < 1 || strokeAlpha < 1

    // prevent overlapped layers flickering
    sideMaterial.polygonOffset = true
    sideMaterial.polygonOffsetFactor = -0.1

    shape.holes.push(hole)

    var options = {
      ...SIDE_EXTRUDE_OPTIONS,
      depth,
      bevelSize: lineWidth,
    }

    var sideGeometry = new THREE.ExtrudeBufferGeometry(shape, options)
    sideGeometry.center()

    var sideMesh = new THREE.Mesh(sideGeometry, sideMaterial)
    sideMesh.rotation.x = - Math.PI / 2
    sideMesh.rotation.y = - Math.PI
    sideMesh.rotation.z = - Math.PI

    return sideMesh
  }
}
