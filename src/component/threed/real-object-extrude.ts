/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import AbstractRealObject from "./abstract-real-object";
import Shape from "../shape";
import { applyAlpha } from "./common";

import * as THREE from "three";
import { error } from "../../util/logger";
import BoundUVGenerator from "../../threed/utils/bound-uv-generator";

const EXTRUDE_OPTIONS = {
  steps: 1,
  depth: 1,
  bevelEnabled: false
};

const SIDE_EXTRUDE_OPTIONS = {
  steps: 1,
  depth: 1,
  bevelEnabled: true,
  bevelThickness: 0,
  bevelSize: 0,
  bevelSizeSegments: 5
};

export default class RealObjectExtrude extends AbstractRealObject {
  private _boundUVGenerator;
  private _mainMesh: THREE.Mesh;
  private _sideMesh: THREE.Mesh;

  build() {
    var { fillStyle, lineStyle = {}, dimension } = this.component.state;

    var { height: depth = 1 } = dimension;

    var { strokeStyle = 0x636363, lineWidth = 1 } = lineStyle;

    var shape: THREE.Shape = new THREE.Shape();
    (this.component as Shape).render(shape);

    var options = {
      ...EXTRUDE_OPTIONS,
      depth,
      UVGenerator: this.boundUVGenerator
    };

    this.boundUVGenerator.setShape({
      extrudedShape: shape,
      extrudedOptions: options
    });

    var geometry = this.createGeometry(shape, options);

    if (fillStyle && fillStyle != "none") {
      var material = this.createMaterial();
      this._mainMesh = this.createMesh(geometry, material);

      this.add(this._mainMesh);
    }

    if (strokeStyle && strokeStyle != "transparent" && lineWidth > 0) {
      this._sideMesh = this.createSideMesh(geometry, shape);

      this.add(this._sideMesh);
    }
  }

  get boundUVGenerator() {
    if (!this._boundUVGenerator)
      this._boundUVGenerator = new BoundUVGenerator();

    return this._boundUVGenerator;
  }

  createGeometry(shape, options) {
    var geometry = new THREE.ExtrudeBufferGeometry(shape, options);
    geometry.center();

    return geometry;
  }

  createMaterial() {
    var { fillStyle = "black" } = this.component.state;

    var params: any = {};

    if (
      typeof fillStyle == "object" &&
      fillStyle.type == "pattern" &&
      fillStyle.image
    ) {
      params = {
        map: new THREE.TextureLoader(THREE.DefaultLoadingManager).load(
          fillStyle.image,
          () => {
            this.component.invalidate();
          },
          e => {
            error(e);
          }
        ),
        side: THREE.FrontSide
      };
    } else if (typeof fillStyle == "string") {
      if (fillStyle !== "transparent") {
        params.color = fillStyle;
      }
    }

    const material = new THREE.MeshLambertMaterial(params);

    return material;
  }

  createMesh(geometry, material) {
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.y = -Math.PI;
    mesh.rotation.z = -Math.PI;

    return mesh;
  }

  createSideMesh(geometry, shape) {
    var { dimension, lineStyle = {} } = this.component.state;

    var { height: depth = 1 } = dimension;

    var { lineWidth = 0, strokeStyle = 0x000000 } = lineStyle;

    var hole = new THREE.Path();
    hole.setFromPoints(shape.getPoints());

    var sideMaterial = new THREE.MeshLambertMaterial({
      color: strokeStyle,
      side: THREE.FrontSide
    });

    // prevent overlapped layers flickering
    sideMaterial.polygonOffset = true;
    sideMaterial.polygonOffsetFactor = -0.1;

    shape.holes.push(hole);

    var options = {
      ...SIDE_EXTRUDE_OPTIONS,
      depth,
      bevelSize: lineWidth
    };

    var sideGeometry = new THREE.ExtrudeBufferGeometry(shape, options);
    sideGeometry.center();

    var sideMesh = new THREE.Mesh(sideGeometry, sideMaterial);
    sideMesh.rotation.x = -Math.PI / 2;
    sideMesh.rotation.y = -Math.PI;
    sideMesh.rotation.z = -Math.PI;

    return sideMesh;
  }

  updateAlpha() {
    var { alpha = 1, fillStyle, lineStyle } = this.component.state;

    this._mainMesh && applyAlpha(this._mainMesh.material, alpha, fillStyle);
    this._sideMesh &&
      applyAlpha(
        this._sideMesh.material,
        alpha,
        lineStyle && lineStyle.strokeStyle
      );
  }
}
