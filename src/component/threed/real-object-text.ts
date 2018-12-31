/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import RealObjectMesh from "./real-object-mesh";

import * as THREE from "three";

import { textTexture, textBounds } from "../text/text-texture";

/**
 * RealObjectText
 */
export default class RealObjectText extends RealObjectMesh {
  buildGeometry() {
    // TODO component.text의 heavy한 로직을 반복적으로 실행하지 않도록, 캐싱하자.
    var text = this.component.text;
    let { width, height } = textBounds(text, this.component.state.textStyle);

    this.component.dimension = {
      width,
      height,
      depth: 1
    };

    return new THREE.PlaneBufferGeometry(width, height);
  }

  buildMaterial() {
    let { width, height } = this.component.state.dimension;
    var textStyle = this.component.state.textStyle;

    // TODO component.text의 heavy한 로직을 반복적으로 실행하지 않도록, 캐싱하자.
    var text = this.component.text;

    return new THREE.MeshBasicMaterial({
      map: textTexture(text, width, height, textStyle),
      transparent: true,
      alphaTest: 0.2,
      side: THREE.DoubleSide
    });
  }

  /* overide */
  updateDimension() {
    // Intentionally do nothing
  }

  updateAlpha() {
    // material의 transparency는 항상 true으로 유지되어야 한다.
    super.updateAlpha();

    (this.material as any).transparent = true;
  }
}
