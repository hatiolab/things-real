/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { registry, residence } from './registry'
import { LifeCycleCallback, EventCallback } from './callback'
import { model, state } from './model'
import { clonedeep } from '../util'
import * as data from './data/data'

export default class Component implements LifeCycleCallback, EventCallback {
  static register(type: string, clazz: FunctionConstructor): FunctionConstructor {
    return registry.register(type, clazz);
  }

  static get residents(): Object {
    return residence.residents;
  }

  constructor({
    model = {}
  } = {}) {

    this._model = clonedeep(model);

    residence.put(this);
  }

  dispose(): void {
  }

  /* LifeCycleCallback */
  /**
   * created
   * 하위 자식 컴포넌트까지 다 생성한 후에 호출된다.
   */
  created() { }

  /**
   * added
   * 부모 컨테이너에 추가된 후에 호출된다.
   */
  added(parent) { }

  /**
   * removed
   * 부모 컨테이너에서 제거된 후에 호출된다.
   */
  removed(parent) { }

  /**
   * ready
   * 전체 모델이 만들어지고, 동작준비가 완료된 상태에서 호출됨. 단 한번만 호출됨.
   */
  ready() { }

  /**
   * dispose
   * 컴포넌트가 완전히 해체되면 호출된다.
   */
  disposed() { }

  /* EventCallback */
  onchange(after, before) { }

  /* model, state */
  private _model: Object = {}
  private _state: Object = {}

  get model(): Object {
    return this._model;
  }

  get state(): Object {
    return {
      ...this._model,
      ...this._state
    }
  }
}

/* Method Object mixin 방법. */
Object.assign(Component.prototype, ...[
  model, state,
  data
]);

/* 단순한 state 속성의 getter/setter 정의 방법. */
[
  'center', 'dimension', 'rotate', 'data'
].forEach(property => Object.defineProperty(Component.prototype, property, {
  get() {
    return this.getState(property);
  },

  set(value) {
    this.setState(property, value);
  },

  enumerable: true,
  configurable: true
}))