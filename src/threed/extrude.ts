/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as THREE from 'three'

import CoverObject3D from './cover-object-3d'
import tinycolor from 'tinycolor2'

import BoundUVGenerator from './bound-uv-generator'

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

export default class Extrude extends CoverObject3D {

  initialize() {
  }

  update(force) {

    var { theta, tx, ty, sx, sy, sz = 1, fade } = this.component.deltas
    if (!force && !(theta || tx || ty || sx != 1 || sy != 1 || fade != 0)) {
      return;
    }

    this.clearChildren();
    this.updateObject();

    // TODO face delta 에 대한 처리가 별도로 필요함.
    // material들을 다 찾아서 alpha 처리를 해준다 ??

    var {
      rotation: ry = 0, rotationX: rx = 0, rotationY: rz = 0,
      depth = 0, zPos: z = 0,
      scale = {}
    } = this.component.state;

    var {
      x: scalex = 1,
      y: scaley = 1,
      z: scalez = 1
    } = scale;

    var {
      x, y
    } = this.component.center;

    var {
      width: fwidth,
      height: fheight
    } = this.component.rootModel.bounds

    x -= fwidth / 2 + tx;
    y -= fheight / 2 + ty;
    z += depth / 2;

    this.position.set(x, z, y);
    this.rotation.set(
      -rx,
      -ry + theta,
      -rz
    );
    this.scale.set(
      scalex * sx, scalez * sz, scaley * sy
    );

  }

  updateReverse() {
    var rotation = this.rotation;
    var position = this.position;
    var scale = this.scale;

    var { theta, tx, ty, sx, sy, sz = 1, fade } = this.component.deltas

    var {
      width: fwidth,
      height: fheight
    } = this.component.rootModel.bounds

    var {
      depth = 0
    } = this.component.state;

    // TODO 두번의 set event를 한번으로 끝내야 함.
    // 방안.0 center 속성에 zPos를 포함해야 한다.
    // 방안.1 트랜잭션처럼 묶는 기능이 필요하다.
    this.component.center = {
      x: position.x + fwidth / 2 - tx,
      y: position.z + fheight / 2,
      z: position.y - ty
    };

    this.component.set({
      zPos: position.y - depth / 2,
      rotationX: - rotation.x,
      rotation: - rotation.y - theta,
      rotationY: - rotation.z,
      scale: {
        x: scale.x / sx,
        y: scale.z / sy,
        z: scale.y / sz
      }
    });
  }

  createShape() {
    throw 'Not Implemented Yet.';
  }

  updateObject() {
    var {
      fillStyle,
      strokeStyle = 0x636363,
      lineWidth = 1,
      alpha = 1,
      depth = 1
    } = this.component.state;

    var shape = this.createShape();

    var options = {
      ...EXTRUDE_OPTIONS,
      depth: depth,
      UVGenerator: this.boundUVGenerator
    };

    this.boundUVGenerator.setShape({
      extrudedShape: shape,
      extrudedOptions: options
    })

    var geometry = this.createGeometry(shape, options);

    if (fillStyle && fillStyle != 'none') {
      var material = this.createMaterial();
      var mesh = this.createMesh(geometry, material);

      this.add(mesh);
    }

    if (strokeStyle && strokeStyle != 'transparent' && lineWidth > 0) {
      var sideMesh = this.createSideMesh(geometry, shape, options)

      this.add(sideMesh)
    }
  }

  get boundUVGenerator() {
    if (!this._boundUVGenerator)
      this._boundUVGenerator = new BoundUVGenerator();

    return this._boundUVGenerator
  }

  createGeometry(shape, options) {
    var geometry = new THREE.ExtrudeBufferGeometry(shape, options);
    geometry.center();

    return geometry
  }

  createMaterial() {
    var {
      fillStyle,
      alpha = 1
    } = this.component.state;

    if (!fillStyle) {
      return;
    }

    var material;
    if (fillStyle.type == 'pattern' && fillStyle.image) {
      var texture = this._visualizer._textureLoader.load(this._visualizer.app.url(fillStyle.image), texture => {
        texture.minFilter = THREE.LinearFilter
        this._visualizer.render_threed()
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
      let params = {};

      if (fillStyle && fillStyle !== 'transparent') {
        params.color = fillStyle;
      }

      material = new THREE.MeshLambertMaterial(params)
    }

    var tinyFillStyle = tinycolor(fillStyle);
    var fillAlpha = tinyFillStyle.getAlpha();

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
      strokeStyle = 0x000000,
      depth = 0,
      lineWidth = 0,
      alpha = 1
    } = this.component.state;

    var hole = new THREE.Path();
    hole.setFromPoints(shape.getPoints());

    var sideMaterial = new THREE.MeshLambertMaterial({
      color: strokeStyle
    })

    var tinyStrokeStyle = tinycolor(strokeStyle);
    var strokeAlpha = tinyStrokeStyle.getAlpha();
    sideMaterial.opacity = alpha * strokeAlpha;
    sideMaterial.transparent = alpha < 1 || strokeAlpha < 1

    // prevent overlapped layers flickering
    sideMaterial.polygonOffset = true;
    sideMaterial.polygonOffsetFactor = -0.1;

    shape.holes.push(hole);

    var options = {
      ...SIDE_EXTRUDE_OPTIONS,
      depth: depth,
      bevelSize: lineWidth,
    };

    var sideGeometry = new THREE.ExtrudeBufferGeometry(shape, options);
    sideGeometry.center();

    var sideMesh = new THREE.Mesh(sideGeometry, sideMaterial);
    sideMesh.rotation.x = - Math.PI / 2
    sideMesh.rotation.y = - Math.PI
    sideMesh.rotation.z = - Math.PI

    return sideMesh
  }
}
