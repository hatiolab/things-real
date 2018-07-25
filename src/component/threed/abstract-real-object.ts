/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Component, Container } from '..'
import RealObject from './real-object'

import * as THREE from 'three'

export default abstract class AbstractRealObject extends THREE.Object3D implements RealObject {
  protected _component: Component
  private updating: boolean

  constructor(component) {
    super()

    this.component = component

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

  initialize() { }

  dispose() {
    this.clear();
  }

  get isRealObject() {
    return true
  }

  get component() {
    return this._component
  }

  set component(component) {
    this.clear()

    this._component = component

    this.build()
  }

  setDimension(dimension) {
    this.clear()
    this.build()
  }

  protected abstract build()

  clear() {
    this.children.slice().forEach(child => {
      if (child['dispose'])
        child['dispose']();
      if (child['geometry'] && child['geometry']['dispose'])
        child['geometry']['dispose']();
      if (child['material'] && child['material']['dispose'])
        child['material']['dispose']();
      if (child['texture'] && child['texture']['dispose'])
        child['texture']['dispose']();
      this.remove(child)
    })
  }

  prerender(force?) {
    // this.update();

    // if (this.component.isContainer) {
    //   (this.component as Container).components.forEach(child => {
    //     let object = child.object3D as AbstractRealObject
    //     object.prerender(force)
    //   })
    // }
  }

  update(force?) {

    // var { theta, tx, ty, sx, sy, fade } = this.component.deltas
    // if (!force && !(theta || tx || ty || sx != 1 || sy != 1 || fade != 0)) {
    //   return;
    // }

    // // TODO face delta 에 대한 처리가 별도로 필요함.
    // // material들을 다 찾아서 alpha 처리를 해준다 ??

    // var {
    //   rotation: rz = 0, rotationX: rx = 0, rotationY: ry = 0,
    //   zPos: z = 0,
    //   scale = { x: 1, y: 1, z: 1 }
    // } = this.component.state;

    // var {
    //   x, y
    // } = this.component.center;

    // x += tx;
    // y += ty;
    // // z += tz;

    // this.position.set(x, y, z);
    // this.rotation.set(
    //   rx,
    //   ry,
    //   rz + theta
    // );
    // this.scale.set(
    //   scale.x * sx, scale.y * sy, scale.z
    // );
  }

  updateReverse() {
    // var rotation = this.rotation;
    // var position = this.position;
    // var scale = this.scale;

    // var { theta, tx, ty, sx, sy, sz = 1, fade } = this.component.deltas

    // // TODO 두번의 set event를 한번으로 끝내야 함.
    // // 방안.0 center 속성에 zPos를 포함해야 한다.
    // // 방안.1 트랜잭션처럼 묶는 기능이 필요하다.
    // this.component.center = {
    //   x: position.x - tx,
    //   y: position.y - ty,
    // };

    // this.component.set({
    //   zPos: position.z,
    //   rotationX: rotation.x,
    //   rotation: rotation.z - theta,
    //   rotationY: rotation.y,
    //   scale: {
    //     x: scale.x / sx,
    //     y: scale.y / sy,
    //     z: scale.z / sz
    //   }
    // });
  }

  onchange(after, before) {
    if (this.updating) {
      return;
    }
    this.updating = true;

    requestAnimationFrame(() => {
      this.update(true);
      this.updating = false;
    })
  }
}
