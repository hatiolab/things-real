/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Vector3, Dimension, ComponentModel, DataSpreadModel, TextOptions } from '../../types'
import EventCallback from '../callback/event-callback'
import EventSource from '../../event/event-source'
import clonedeep from '../../util/clone-deep'
import { isEqual } from 'lodash'

export class ModelAndState extends EventSource implements ComponentModel, EventCallback {

  /**
   * @param {ComponentModel} model ComponentModel
   */
  constructor(model: ComponentModel) {
    super();

    this._model = clonedeep(model)
    delete this._model.components
  }

  private _model: ComponentModel = {}
  private _state: ComponentModel = {}

  /**
   * 객체의 모델 정보 전체 조회
   */
  get model(): ComponentModel {
    return this._model
  }

  /**
   * 객체의 상태 정보 전체 조회
   */
  get state(): ComponentModel {
    return {
      ...this._model,
      ...this._state
    }
  }

  /**
   * component의 state변경시 호출되는 callback
   * @param after 
   * @param before 
   */
  onchange(after: object, before: object) {
    Object.keys(after).forEach(key => {
      let handler = `onchange${key}`
      this[handler] && this[handler](after[key], before[key])
    })
  }

  /**
   * get == getState 
   */
  get(prop: string) {
    return this.getState(prop)
  }

  /**
   * set == setState 
   */
  set(props: Object | string, value?: any) {
    this.setState(props, value)
  }

  /**
   * 주어진 이름의 모델 속성을 제공
   * @param {string} prop 속성명
   */
  getModel(prop: string) {
    return this._model[prop]
  }

  /**
   * 모델 속성을 변경
   * @param {Object | string} prop 속성명 또는 속성모음 객체
   * @param {any} value 속성명(prop)이 string 인 경우 해당 속성의 값
   */
  setModel(props: Object | string, value?: any) {
    if (typeof props === 'string') {
      return this.setModel({ [props]: value })
    }

    var after = {}
    var before = {}
    var changed = false

    var cloned = clonedeep(props)

    // Object.keys() 또는 for..in 으로는 undefined value 를 읽어오지 못함.
    // Object.getOwnPropertyNames() 를 사용해야 함.

    Object.getOwnPropertyNames(cloned).forEach(key => {

      let before_val = this.getState(key)
      let after_val = cloned[key]

      if (!isEqual(before_val, after_val)) {
        before[key] = before_val
        after[key] = after_val

        changed = true
      }

      delete this._state[key]
    })

    Object.assign(this._model, props);

    /** 
     * 모델 속성의 변화는, state 속성의 변화도 일으킨다.
     * 변화된 모델 속성과 동일한 state의 속성을 제거한다.
     * state속성이 제거되면, state에도 영향을 미치며, onchange 이벤트를 발생시킬 수 있다. 
     */
    if (changed) {
      this.onchange && this.onchange(after, before);
      this.trigger('change', after, before)
    }
  }

  /**
   * 객체의 상태값을 조회
   * @param {string} prop 
   */
  getState(prop: string) {
    return (prop in this._state) ? this._state[prop] : this.getModel(prop)
  }

  /**
   * 객체의 상태값을 초기화함. 이 경우 모델값과 상태값이 같아진다.
   * @param {string} prop 
   */
  clearState(props: string[] | string) {
    if (typeof props === 'string') {
      return this.clearState([props])
    }

    var after = {}
    var before = {}
    var changed = false

    props.forEach(key => {
      let before_val = this.getState(key)
      let after_val = this.getModel(key)

      if (!isEqual(before_val, after_val)) {
        before[key] = before_val
        after[key] = after_val

        changed = true
      }

      delete this._state[key];
    })

    if (changed) {
      this.onchange && this.onchange(after, before);
      this.trigger('change', after, before)
    }
  }

  /**
   * 객체의 상태값을 변경
   * @param {Object | string} prop 속성명 또는 속성모음 객체
   * @param {any} value 속성명(prop)이 string 인 경우 해당 속성의 값
   */
  setState(props: Object | string, value?: any) {

    if (typeof props === 'string')
      return this.setState({ [props]: value })

    var after = {}
    var before = {}
    var changed = false

    var cloned = clonedeep(props)

    // Object.keys() 또는 for..in 으로는 undefined value 를 읽어오지 못함.
    // Object.getOwnPropertyNames() 를 사용해야 함.

    Object.getOwnPropertyNames(cloned).forEach(key => {

      let before_val = this.getState(key)
      let after_val = cloned[key]

      if (!isEqual(before_val, after_val)) {
        before[key] = before_val
        after[key] = after_val
        this._state[key] = after_val

        changed = true
      }
    })

    if (changed) {
      this.onchange && this.onchange(after, before)
      this.trigger('change', after, before)
    }
  }

  /**
   * Simple Properties
   */
  public textOptions: TextOptions
  public dimension: Dimension
  public translate: Vector3
  public scale: Vector3
  public rotate: Vector3
  public color: any
  public style: any
  public templatePrefix: string
  public data: any
  public mappings: DataSpreadModel[]
}

/* 단순한 state 속성의 getter/setter 정의 방법. */
[
  'textStyle', 'textOptions', 'dimension', 'translate', 'scale', 'rotate', 'lineStyle', 'fillStyle', 'color', 'templatePrefix', 'data', 'mappings', 'animation', 'alpha'
].forEach(property => Object.defineProperty(ModelAndState.prototype, property, {
  get() {
    return this.getState(property)
  },

  set(value) {
    this.setState(property, value)
  },

  enumerable: true,
  configurable: true
}))