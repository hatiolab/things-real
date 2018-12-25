/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from "./component";
import Shape from "./shape";

import * as THREE from "three";

export default class Ellipse extends Shape {
  static get type() {
    return "ellipse";
  }

  static readonly NATURE = {
    mutable: false,
    resizable: true,
    rotatable: true,
    properties: []
  };

  render(shape) {
    var { dimension } = this.state;

    var { width = 100, depth = 100 } = dimension;

    var curve = new THREE.EllipseCurve(
      0, // ax
      0, // ay
      width / 2, // xRadius
      depth / 2, // yRadius
      0, // aStartAngle
      2 * Math.PI, // aEndAngle
      false, // aClockwise
      0 // aRotation
    );

    var points = curve.getPoints(50);

    shape.moveTo(points[0].x, points[0].y);
    points.slice(1, 49).forEach(point => {
      shape.lineTo(point.x, point.y);
    });
    shape.lineTo(points[0].x, points[0].y);
  }
}

Component.register(Ellipse.type, Ellipse);
