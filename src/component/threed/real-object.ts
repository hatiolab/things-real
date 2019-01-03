/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from "../component";
import * as THREE from "three";

export default interface RealObject extends THREE.Object3D {
  component: Component;
  isRealObject;
  // camera;

  dispose();

  /**
   * Component의 상태 속성을 3D 오브젝트에 반영한다.
   */
  update();

  /**
   * Component의 dimension 상태 속성을 오브젝트에 반영한다.
   */
  updateDimension();
  /**
   * Component의 translate 상태 속성을 오브젝트에 반영한다.
   */
  updateTranslate();
  /**
   * Component의 rotate 상태 속성을 오브젝트에 반영한다.
   */
  updateRotate();
  /**
   * Component의 scale 상태 속성을 오브젝트에 반영한다.
   */
  updateScale();
  /**
   * Component의 alpha 상태 속성을 오브젝트에 반영한다.
   */
  updateAlpha();
  /**
   * Component의 hidden 상태 속성을 오브젝트에 반영한다.
   */
  updateHidden();
  // /**
  //  * Component의 camera 상태 속성을 오브젝트에 반영한다.
  //  */
  // updateCamera();

  updateTransform();
  updateTransformReverse();
}
