import Component from './component'
import Container from './container'
import { warn, error, clonedeep } from '../util'
import { compile } from '../main'

export default class RootContainer extends Container {

  private indexMap: Object = {}
  private templateMap: Object = {}
  private templatePrefixes: string[] = []

  get isRoot() {
    return true
  }

  get root() {
    return this
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
}

Component.register('root', RootContainer)
