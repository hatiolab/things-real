/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'
import Container from './container'
import RealObjectScene from './threed/real-object-scene'
import { SceneModel } from '../types'
import { warn, error, clonedeep } from '../util'
import { compile } from '../main'
import { debounce } from 'lodash'
import EventEngine from '../event/event-engine'

var refresh_mapping_debouncer = debounce(function mapper(comp: Component) {
  comp.dataSpreadEngine.execute()
  comp.isContainer && (comp as Container).components.forEach(child => mapper(child))
}, 500)

export default class RootContainer extends Container {

  private indexMap: Object = {}
  private templateMap: Object = {}
  /**
   * 알파벳 역순으로 템플릿 ID인덱스를 유지함.
   */
  private templatePrefixes: string[] = []
  private eventEngine: EventEngine = new EventEngine(this)

  /**
   * three.js related
   */
  private scene3D: RealObjectScene

  constructor(model: SceneModel) {
    super(model)

    this.refreshMappings()
  }

  get isRoot() {
    return true
  }

  get root() {
    return this
  }

  get object3D() {
    if (!this.scene3D) {
      this.scene3D = new RealObjectScene(this)
    }
    return this.scene3D
  }

  get width() {
    return this.getState('width')
  }

  get height() {
    return this.getState('height')
  }

  addTemplate(prefix, component) {

    var old = this.templateMap[prefix]
    if (old)
      error('Template replaced (duplicated)', prefix, component, old)

    this.templateMap[prefix] = component

    delete this.templatePrefixes
  }

  removeTemplate(prefix, component) {

    var old = this.templateMap[prefix]

    if (old !== component)
      warn('Removing template failed (different)', prefix, component, old)
    else
      delete this.templateMap[prefix]

    delete this.templatePrefixes
  }

  findTemplateFor(id) {
    if (!this.templatePrefixes)
      this.templatePrefixes = Object.keys(this.templateMap).sort().reverse();

    var prefix = this.templatePrefixes.find(prefix => { return id.startsWith(prefix) })
    if (prefix)
      return this.templateMap[prefix]
  }

  addIndex(id, component) {

    var old = this.indexMap[id]
    if (old)
      error('Index replaced (duplicated)', id, component, old)

    this.indexMap[id] = component
  }

  removeIndex(id, component) {

    var old = this.indexMap[id]

    if (old !== component)
      warn('Removing index failed (different)', id, component, old)
    else
      delete this.indexMap[id]
  }

  findById(id) {
    return this.indexMap[id]
  }

  findOrCreate(id) {
    var component = this.indexMap[id]

    if (!component) {
      let template = this.findTemplateFor(id)
      if (template) {
        let clone = Object.assign(clonedeep(template.hierarchy), {
          id: id,
          templatePrefix: ''
        })
        component = compile(clone)
        this.addComponent(component)
      }
    }

    return component
  }

  refreshMappings() {
    // if (this.disposed)
    //   return

    // this.dataSpreadEngine.execute()

    refresh_mapping_debouncer(this)
  }

  get eventMap() {
    return {
      '(root)': {
        '(descendant)': {
          added: this._onadded,
          removed: this._onremoved,
          change: this._onchanged
        }
      }
    }
  }

  invalidate() {
    this.trigger('render')
  }

  private _onadded(container, component) {
    this._addTraverse(component)
    this.refreshMappings()

    this.invalidate()
  }

  private _onremoved(container, component) {
    this._removeTraverse(component)

    this.invalidate()
  }

  private _onchanged(after, before, hint) {
    if (before.templatePrefix)
      this.removeTemplate(before.templatePrefix, hint.origin)

    if (after.templatePrefix)
      this.addTemplate(after.templatePrefix, hint.origin)


    if (before.id)
      this.removeIndex(before.id, hint.origin)

    if (after.id)
      this.addIndex(after.id, hint.origin)

    if (before.id != after.id || before.class != after.class)
      this.refreshMappings()

    this.invalidate()
  }

  private _addTraverse(component: Component) {
    if (component.isContainer) {
      (component as Container).components.forEach(child => this._addTraverse(child))
    }

    var {
      id, templatePrefix
    } = component.model;

    if (id)
      this.addIndex(id, component)

    if (templatePrefix)
      this.addTemplate(templatePrefix, component)

    this.eventEngine.add(component, component.eventMap)
  }

  private _removeTraverse(component: Component) {
    if (component.isContainer)
      (component as Container).components.forEach(child => this._removeTraverse(child))

    var {
      id, templatePrefix
    } = component.model;

    if (id)
      this.removeIndex(id, component)

    if (templatePrefix)
      this.removeTemplate(templatePrefix, component)

    this.eventEngine.remove(component)
  }
}

Component.register('root', RootContainer)
