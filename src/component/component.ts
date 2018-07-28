/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { registry, residence } from './registry'
import { LifeCycleCallback } from './callback'
import { ModelAndState, select } from './model'
import { Class, ComponentModel } from '../types'
import { DataSpreadEngine } from './data'
import Container from './container'
import RootContainer from './root-container'
import { clonedeep, mixin, error } from '../util'
import RealObjectDummy from './threed/real-object-dummy';

type EventMap = { [selector: string]: { [delegator: string]: { [event: string]: Function } } }

const SCALE = { x: 1, y: 1, z: 1 }
const ROTATE = { x: 0, y: 0, z: 0 }
const TRANSLATE = ROTATE

export default class Component extends ModelAndState implements LifeCycleCallback {

  static register(type: string, clazz?: Class): Class {
    return registry.register(type, clazz);
  }

  static get residents(): Object {
    return residence.residents;
  }

  private _object3D: THREE.Object3D

  constructor(model: ComponentModel) {
    super(model);

    residence.put(this);
  }

  dispose() { }

  /* LifeCycleCallback */
  created() { }
  added(parent) { }
  removed(parent) { }
  ready() { }
  disposed() { }

  /* Component */
  get hierarchy(): ComponentModel {
    return clonedeep(this.model);
  }

  public parent: Container

  get isContainer(): boolean {
    return false
  }

  get isRoot(): boolean {
    return false
  }

  get root(): RootContainer {
    return this.parent.root
  }

  get object3D(): THREE.Object3D {
    if (!this._object3D) {
      this._object3D = this.buildObject3D()
      this.updateTransform()
    }
    return this._object3D
  }

  protected buildCSS3DObject(): THREE.Object3D {
    return
  }

  get renderer() {
    return this.root.renderer
  }

  protected buildObject3D(): THREE.Object3D {
    return new RealObjectDummy(this)
  }

  protected updateTransform() {

    var {
      scale: {
        x: sx = 1,
        y: sy = 1,
        z: sz = 1
      } = SCALE,
      translate: {
        x: tx = 0,
        y: ty = 0,
        z: tz = 0
      } = TRANSLATE,
      rotate: {
        x: rx = 0,
        y: ry = 0,
        z: rz = 0
      } = ROTATE
    } = this.state

    if (this.object3D) {
      this.object3D.position.set(tx, ty, tz);
      this.object3D.rotation.set(rx, ry, rz);
      this.object3D.scale.set(sx, sy, sz);
    }
  }

  updateTransformReverse() {
    var object3D = this.object3D

    var rotation = object3D.rotation;
    var position = object3D.position;
    var scale = object3D.scale;

    this.set({
      rotate: {
        x: rotation.x,
        y: rotation.y,
        z: rotation.z
      },
      translate: {
        x: position.x,
        y: position.y,
        z: position.z
      },
      scale: {
        x: scale.x,
        y: scale.y,
        z: scale.z
      }
    })
  }

  /* Event */
  public eventMap: EventMap

  prerender(context: CanvasRenderingContext2D | WebGLRenderingContext) { }
  render(context: CanvasRenderingContext2D | WebGLRenderingContext) { }

  /*
   * 조건에 맞는 컴포넌트를 찾기 위한 기능들
   *
   * findAll(selector, ...others) 조건에 맞는 모든 컴포넌트를 찾아낸다.
   * findById(id) 파라미터 id와 같은 id를 가진 컴포넌트를 찾는다.
   */

  findAll(selector: string | Function, ...others) {
    if (typeof selector === 'string')
      return select(selector, this, others[0] || this) // others[0] means (self)

    if (typeof selector === 'function' && selector(this, ...others))
      return [this]
  }

  findById(id: string) {
    return this.root.findById(id)
  }

  /**
   * Data Manipulation Methods
   */

  private _dataSpreadEngine: DataSpreadEngine

  get dataSpreadEngine​​() {
    if (!this._dataSpreadEngine) {
      this._dataSpreadEngine = new DataSpreadEngine(this)
    }

    return this._dataSpreadEngine
  }

  /**
   * data state 변경시 호출되는 callback
   * @param after 
   * @param before 
   */
  onchangedata(after, before) {
    this.dataSpreadEngine.execute()
  }

  /**
   * data state 변경시 호출되는 callback
   * @param after 
   * @param before 
   */
  onchangemappings(after, before) {
    this.dataSpreadEngine.reset()
  }

  /* 아래 로직들은 모두 prerender로 들어가는 것이 좋겠다. */
  onchangetranslate(after, before) {
    var { x = 0, y = 0, z = 0 } = after
    this.object3D.position.set(x, y, z)
  }

  onchangerotate(after, before) {
    var { x = 0, y = 0, z = 0 } = after
    this.object3D.rotation.set(x, y, z)
  }

  onchangescale(after, before) {
    var { x = 1, y = 1, z = 1 } = after
    this.object3D.scale.set(x, y, z)
  }

  onchangedimension(after, before) {
    (this.object3D as any).update()
  }
}

Component.register('component', Component)

