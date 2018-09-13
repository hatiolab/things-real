/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { registry, residence } from './registry'
import { LifeCycleCallback } from './callback'
import { ModelAndState, select } from './model'
import { Class, ComponentModel, Nature } from '../types'
import Container from './container'
import RootContainer from './root-container'
import RealObject from './threed/real-object'
import RealObjectDummy from './threed/real-object-dummy'
import { DataSpreadEngine } from './data'
import { clonedeep, error } from '../util'

type EventMap = { [selector: string]: { [delegator: string]: { [event: string]: Function } } }

export default class Component extends ModelAndState implements LifeCycleCallback {

  static readonly UNIT_DIMENSION = { width: 1, height: 1, depth: 1 }
  static readonly UNIT_SCALE = { x: 1, y: 1, z: 1 }
  static readonly UNIT_TRANSLATE = { x: 0, y: 0, z: 0 }
  static readonly UNIT_ROTATE = { x: 0, y: 0, z: 0 }

  static readonly NATURE: Nature = {
    mutable: false,
    resizable: true,
    rotatable: true,
    properties: [],
    'value-property': 'text'
  }

  /**
   * 컴포넌트 타입을 등록
   * @param {string} type component type
   * @param {Class} clazz component class
   */
  static register(type: string, clazz?: Class): Class {
    return registry.register(type, clazz);
  }

  /**
   * 현재 어플리케이션에 메모리에 남아있는 모든 컴포넌트 리스트를 조회
   */
  static get residents(): Object {
    return residence.residents;
  }

  /**
   * 컴포넌트 타입 - 모든 컴포넌트는 type 이름 정보를 제공해야한다.
   */
  static get type(): string {
    return 'component'
  }

  /**
   * 새로운 컴포넌트 인스턴스를 모델 정보에 맞게 생성
   * @param {ComponentModel} model 컴포넌트 모델
   */
  constructor(model: ComponentModel) {
    super(model);

    residence.put(this);
  }

  /**
   * 컴포넌트 제거
   */
  dispose() {
    this.disposeDataSpreadEngine()
    this.disposeObject3D()
  }

  /* LifeCycleCallback */
  created() { }
  added(parent) { }
  removed(parent) { }
  ready() { }
  disposed() { }

  /* Component */

  get nature() {
    return Component.NATURE
  }

  get type() {
    return registry.clazz(this.constructor.name)['type']
  }

  /**
   * property hierarchy
   * readonly
   */
  get hierarchy(): ComponentModel {
    return clonedeep(this.model)
  }

  /**
   * property isContainer
   * readonly
   */
  get isContainer(): boolean {
    return false
  }

  /**
   * property isRoot
   * readonly
   */
  get isRoot(): boolean {
    return false
  }

  /**
   * property isDomComponent
   * readonly
   */
  get isDomComponent(): boolean {
    return false
  }

  /**
   * property root
   * readonly
   */
  get root(): RootContainer {
    return this.parent.root
  }

  /**
   * property parent
   */
  private _parent: Container

  get parent() {
    return this._parent
  }

  set parent(parent) {
    this._parent = this.setParent(parent)
  }

  protected setParent(parent) {
    return parent
  }

  /**
   * property object3D
   * readonly
   */
  private _object3D: THREE.Object3D

  get object3D(): THREE.Object3D {
    if (!this._object3D) {
      this._object3D = this.buildObject3D()
      this.updateTransform()
    }
    return this._object3D
  }

  protected buildObject3D(): THREE.Object3D {
    return new RealObjectDummy(this)
  }

  protected disposeObject3D() {
    this._object3D && (this._object3D as any).dispose()
  }

  /**
   * property renderer
   * readonly
   */
  get renderer() {
    return this.root.renderer
  }

  /**
   * Component의 상태값의 변화를 Object3D에 반영
   */
  protected updateTransform() {

    var {
      scale: {
        x: sx = 1,
        y: sy = 1,
        z: sz = 1
      } = Component.UNIT_SCALE,
      translate: {
        x: tx = 0,
        y: ty = 0,
        z: tz = 0
      } = Component.UNIT_TRANSLATE,
      rotate: {
        x: rx = 0,
        y: ry = 0,
        z: rz = 0
      } = Component.UNIT_ROTATE
    } = this.state

    if (this.object3D) {
      this.object3D.position.set(tx, ty, tz);
      this.object3D.rotation.set(rx, ry, rz);
      this.object3D.scale.set(sx, sy, sz);
    }
  }

  /**
   * Object3D 모델의 변화를 Component의 모델값에 반영
   */
  updateTransformReverse() {
    var object3D = this.object3D

    var rotation = object3D.rotation;
    var position = object3D.position;
    var scale = object3D.scale;

    this.setModel({
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

  /**
   * 컴포넌트 계층에서 selector에 해당하는 컴포넌트들을 찾는다
   * @param {string} selector 
   * @param {any} others 
   */
  findAll(selector: string | Function, ...others): Component[] {
    if (typeof selector === 'string')
      return select(selector, this, others[0] || this) // others[0] means (self)

    if (typeof selector === 'function' && selector(this, ...others))
      return [this]
  }

  /**
   * 루트 컨테이너 계층 안에서 해당 id를 가진 컴포넌트를 찾는다
   * @param {string} id 
   */
  findById(id: string): Component {
    return this.root.findById(id)
  }

  /**
   * Data Manipulation
   */
  private _dataSpreadEngine: DataSpreadEngine

  get dataSpreadEngine() {
    if (!this._dataSpreadEngine) {
      this._dataSpreadEngine = this.createDataSpreadEngine()
    }

    return this._dataSpreadEngine
  }

  protected createDataSpreadEngine() {
    return new DataSpreadEngine(this)
  }

  protected disposeDataSpreadEngine() {
    this._dataSpreadEngine && this._dataSpreadEngine.dispose()
  }

  /**
   * redraw common
   */
  public invalidate() {
    this.root.invalidate()
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
    (this.object3D as RealObject).update()
  }
}

Component.register(Component.type, Component)

