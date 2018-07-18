/**
 * Data Manipulation Methods
 */

import { DataSpreadModel } from '../../types'
import Component from '../component'
import DataSpreadRule from './data-spread-rule'
import { error } from '../../util'

function buildSpreadRules(rules: DataSpreadModel[]) {

  if (!rules) {
    return []
  }

  return (rules || []).map(rule => {
    return new DataSpreadRule(rule, this)
  })
}

export default class DataSpreadEngine {
  private owner: Component
  private spreadRules: DataSpreadRule[]

  constructor(owner: Component) {
    this.owner = owner
    this.reset()
  }

  reset() {
    this.spreadRules = buildSpreadRules(this.owner.mappings)
    // this.execute()
  }

  execute() {
    this.spreadRules && this.spreadRules.forEach(rule => {
      try {

        var accessor = rule.accessor(this.owner.data)
        if (accessor == undefined)
          return

        var root = this.owner.root
        var target = rule.target.trim()
        var property = rule.property

        if (target == '(key)') {

          let targets = Object.keys(accessor || {}).map(key => root.findOrCreate(key)).filter(t => !!t)
          targets.forEach(target => target[property] = rule.evaluator(accessor[target.get('id')], [target]))
        } else if (target.startsWith('[')) {
          if (!target.endsWith(']'))
            throw String("rule target should end with ']' to designate property-id.(" + target + ")")

          var id_prop = target.substring(1, target.length - 1)

          if (accessor instanceof Array) {
            accessor.forEach(data => {
              let id = data[id_prop]
              if (id) {
                let component = root.findOrCreate(id)

                if (component) {
                  component[property] = rule.evaluator(data, [component])
                }
              }
            })
          } else if (accessor instanceof Object) {
            let id = accessor[id_prop]
            if (id) {
              let component = root.findOrCreate(id)

              if (component) {
                component[property] = rule.evaluator(accessor, [component])
              }
            }
          } else {
            throw String("rule data should be an object to target property-id.(" + this.owner.data + ")")
          }

        } else {
          let targets = root.findAll(target, this.owner)

          if (targets.length > 0) {
            let value = rule.evaluator(accessor, targets);
            targets.forEach(component => component[property] = value)
          }
        }
      } catch (e) {
        error(e, this, rule);
      }
    })
  }
}
