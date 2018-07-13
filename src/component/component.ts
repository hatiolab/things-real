/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { registry, residence } from './registry'
import { LifeCycleCallback } from './callback'
import { ModelAndState } from './model'
import { Class, ComponentModel } from '../types'
import Container from './container'
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

  private _container: Container

  get container(): Container {
    return this._container
  }

  set container(container: Container) {
    this._container = container
  }

  get isContainer(): boolean {
    return false
  }

}

Component.register('component', Component)

/* Method Object mixin 방법. */
// mixin(Component, [Model]);
