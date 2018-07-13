/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { registry, residence } from './registry'
import { LifeCycleCallback } from './callback'
import { ModelAndState, select } from './model'
import { Class, ComponentModel } from '../types'
import Container from './container'
import RootContainer from './root-container'
import { clonedeep, mixin } from '../util'
// import * as data from './data/data'

export default class Component extends ModelAndState implements LifeCycleCallback {

  static register(type: string, clazz?: Class): Class {
    return registry.register(type, clazz);
  }

  static get residents(): Object {
    return residence.residents;
  }

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

  public container: Container

  get isContainer(): boolean {
    return false
  }

  get isRoot(): boolean {
    return false
  }

  get root(): RootContainer {
    return this.container.root
  }

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
}

/* Method Object mixin 방법. */
// mixin(Component, finder, ...);

Component.register('component', Component)

