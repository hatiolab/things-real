import { ThreeDimension, ComponentModel, DataMappingModel } from '../../types'
import EventCallback from '../callback/event-callback'
import { EventSource } from '../../event'
import { clonedeep } from '../../util'
import { isEqual } from 'lodash'

export abstract class ModelAndState extends EventSource implements ComponentModel, EventCallback {

  constructor(model: Object) {
    super();

    this._model = clonedeep(model);
    delete this._model.components;
  }

  private _model: ComponentModel = {}
  private _state: ComponentModel = {}

  get model(): ComponentModel {
    return this._model;
  }

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
   * get / set 함수는 모델을 변경하거나 가져오는 기능을 하도록 정의되어있으나 (기존 things-scene의 관례에 따라)
   * 실질적으로 State를 변경하거나 가져오는 기능으로 바꾸는 것이 사용 빈도에 있어서 효율적일 것 같다. 또는 아예 제거하는 것이 좋다.
   */
  get(prop: string) {
    return this.getState(prop)
  }

  set(props: Object | string, value?: any) {
    this.setState(props, value);
  }

  getModel(prop: string) {
    return this._model[prop];
  }

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

  getState(prop: string) {
    return (prop in this._state) ? this._state[prop] : this.getModel(prop)
  }

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
      this.onchange && this.onchange(after, before);
      this.trigger('change', after, before)
    }
  }

  /**
   * Simple Properties
   */
  public text: string;
  public translate: ThreeDimension;
  public scale: ThreeDimension;
  public rotate: ThreeDimension;
  public color: any;
  public style: any;
  public data: any;
  public mappings: DataMappingModel[];
}

/* 단순한 state 속성의 getter/setter 정의 방법. */
[
  'text', 'translate', 'scale', 'rotate', 'scale', 'color', 'style', 'data', 'mappings'
].forEach(property => Object.defineProperty(ModelAndState.prototype, property, {
  get() {
    return this.getState(property);
  },

  set(value) {
    this.setState(property, value);
  },

  enumerable: true,
  configurable: true
}))