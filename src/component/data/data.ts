/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { error } from '../../util'
import DataMapping from './data-mapping'

export function executeMappings() {
  this.mappings && this.mappings.forEach(mapping => {

    try {
      var {
        target,
        property,
        accessor
      } = mapping

      accessor = accessor(this.data)
      if (accessor == undefined)
        return

      target = target.trim()

      if (target == '(key)') {

        let targets = Object.keys(accessor || {}).map(key => this.root.findOrCreate(key)).filter(t => !!t);

        if (targets.length > 0) {
          targets.forEach(component => component[property] = mapping.evaluator(accessor[component.get('id')], [component]))
        }
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

export function onchangeData(after, before) {
  executeMappings.call(this)
}

export function buildMappings() {
  if (!this._model.mappings) {
    this._mappings = []
    return
  }

  if (!(this._model.mappings instanceof Array)) {
    error('Mappings model is invalid (should be a Array) ..', this._model.mappings)
    this._mappings = []
    return
  }

  this._mappings = (this._model.mappings || []).map(mapping => {
    return new DataMapping(mapping, this)
  })
}

export function disposeMappings() {
  this._mappings && this._mappings.forEach(mapping => mapping.dispose())
  delete this._mappings
}

export function onchangeMappings(after, before) {
  this.disposeMappings()

  executeMappings.call(this)
}
