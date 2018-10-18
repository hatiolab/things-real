/**
 * Data Manipulation Methods
 */

import { DataSpreadModel } from '../../types'
import Component from '../component'
import DataSpreadRule from './data-spread-rule'
import { error } from '../../util/logger'

function buildSpreadRules(rules: DataSpreadModel[]) {

  if (!rules) {
    return []
  }

  return (rules || []).map(rule => {
    return new DataSpreadRule(rule, this)
  })
}

/**
 * Component의 data 변화를 spread rule에 따라서 수행하는 엔진
 */
export default class DataSpreadEngine {
  private owner: Component
  private spreadRules: DataSpreadRule[]

  /**
   * DataSpreadEngine create
   * @param {Component} owner
   */
  constructor(owner: Component) {
    this.owner = owner
    this.reset()
  }

  /**
   * DataSpreadEngine dispose
   */
  dispose() {
    delete this.spreadRules
    delete this.owner
  }

  /**
   * DataSpreadEngine rebuild
   */
  reset() {
    this.spreadRules = buildSpreadRules(this.owner.mappings)
  }

  /**
   * owner component의 data spread 를 실행
   */
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
