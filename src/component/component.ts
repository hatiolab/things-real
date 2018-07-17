/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { registry, residence } from './registry'
import { LifeCycleCallback } from './callback'
import { ModelAndState, select } from './model'
import { Class, ComponentModel } from '../types'
import Container from './container'
import RootContainer from './root-container'
import { DataMapping } from './data'
import { clonedeep, mixin, error } from '../util'

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

  dispose() {
    this.disposeMappings()
  }

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

  /* Event */
  public eventMap

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

  private _compiledMappings: DataMapping[]

  get compiledMappings() {
    /* 매핑을 다시 빌드한다. */
    if (!this._compiledMappings)
      this.buildMappings()

    return this._compiledMappings
  }

  executeMappings() {
    this.compiledMappings && this.compiledMappings.forEach(mapping => {
      try {

        var accessor = mapping.accessor(this.data)
        if (accessor == undefined)
          return

        var target = mapping.target.trim()
        var property = mapping.property

        if (target == '(key)') {

          let targets = Object.keys(accessor || {}).map(key => this.root.findOrCreate(key)).filter(t => !!t);
          targets.forEach(component => component[property] = mapping.evaluator(accessor[component.get('id')], [component]))
        } else if (target.startsWith('[')) {
          if (!target.endsWith(']'))
            throw String("mapping target should end with ']' to designate property-id.(" + target + ")")

          var id_prop = target.substring(1, target.length - 1)

          if (accessor instanceof Array) {
            accessor.forEach(data => {
              let id = data[id_prop]
              if (id) {
                let component = this.root.findOrCreate(id)

                if (component) {
                  component[property] = mapping.evaluator(data, [component])
                }
              }
            })
          } else if (accessor instanceof Object) {
            let id = accessor[id_prop]
            if (id) {
              let component = this.root.findOrCreate(id)

              if (component) {
                component[property] = mapping.evaluator(accessor, [component])
              }
            }
          } else {
            throw String("mapping data should be an object to target property-id.(" + this.data + ")")
          }

        } else {
          let targets = this.root.findAll(target, this)

          if (targets.length > 0) {
            let value = mapping.evaluator(accessor, targets);
            targets.forEach(component => component[property] = value)
          }
        }
      } catch (e) {
        error(e, this, mapping);
      }
    })
  }

  buildMappings() {
    var mappings = this.mappings;

    if (!mappings) {
      this._compiledMappings = []
      return
    }

    if (!(mappings instanceof Array)) {
      error('Mappings model is invalid (should be a Array) ..', mappings)
      this._compiledMappings = []
      return
    }

    this._compiledMappings = (mappings || []).map(mapping => {
      return new DataMapping(mapping, this)
    })
  }

  disposeMappings() {
    this._compiledMappings && this._compiledMappings.forEach(mapping => mapping.dispose())
    delete this._compiledMappings
  }

  /**
   * data state 변경시 호출되는 callback
   * @param after 
   * @param before 
   */
  onchangedata(after, before) {
    this.executeMappings.call(this)
  }

  /**
   * data state 변경시 호출되는 callback
   * @param after 
   * @param before 
   */
  onchangemappings(after, before) {
    this.disposeMappings()

    this.executeMappings.call(this)
  }
}

/* Method Object mixin 방법. */
// mixin(Component, Data);

Component.register('component', Component)

