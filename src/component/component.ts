/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { registry, residence } from './registry'
import { LifeCycleCallback } from './callback'
import { IModel, Model } from './model'
import { clonedeep, mixin } from '../util'
// import * as data from './data/data'

export default class Component extends Model implements LifeCycleCallback {

  static register(type: string, clazz: FunctionConstructor): FunctionConstructor {
    return registry.register(type, clazz);
  }

  static get residents(): Object {
    return residence.residents;
  }

  constructor({
    model = {}
  } = {}) {
    super(model);

    residence.put(this);
  }

  dispose(): void { }

  /* LifeCycleCallback */
  created() { }
  added(parent) { }
  removed(parent) { }
  ready() { }
  disposed() { }

}

/* Method Object mixin 방법. */
// mixin(Component, [Model]);
