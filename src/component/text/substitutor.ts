/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import objToVal from '../../util/obj-value'

const SELF = function (o) { return o }

function parse(text) {
  var parsed = text.substr(2, text.length - 3).trim().replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.').filter(accessor => !!accessor.trim())
  var accessors = parsed.slice(1)
  return {
    match: text,
    target: parsed[0],
    accessor: accessors.length > 0 ? function (o) {
      return accessors.reduce((o, accessor) => o ? o[accessor] : undefined, o)
    } : SELF
  }
}

export function substitute(expression) {
  if (!expression)
    return

  var text = String(expression)

  var props = (text.match(/#{(\S*)}/gi) || []).map(match => parse(match))
  var ids = (text.match(/\${[^}]*}/gi) || []).map(match => parse(match))

  if (props.length == 0 && ids.length == 0)
    return text

  var result = text
  props.forEach(prop => {
    let value = objToVal(prop.accessor(this.getState(prop.target)))
    result = result.replace(prop.match, value === undefined ? '' : value)
  })

  ids.forEach(id => {
    let target = this.root.findById(id.target)
    let value = objToVal(id.accessor(target && target.data))
    result = result.replace(id.match, value === undefined ? '' : value)
  })

  return result
}

export function buildSubstitutor(expression, component) {
  if (!expression)
    return

  var text = String(expression)

  var props = (text.match(/#{(\S*)}/gi) || []).map(match => parse(match))
  var ids = (text.match(/\${[^}]*}/gi) || []).map(match => parse(match))

  if (props.length == 0 && ids.length == 0)
    return

  return function () {
    var result = text
    props.forEach(prop => {
      let value = objToVal(prop.accessor(component.getState(prop.target)))
      result = result.replace(prop.match, value === undefined ? '' : value)
    })

    ids.forEach(id => {
      let target = component.root.findById(id.target)
      let value = objToVal(id.accessor(target && target.data))
      result = result.replace(id.match, value === undefined ? '' : value)
    })

    return result
  }
}
