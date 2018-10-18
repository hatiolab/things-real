/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { error } from '../../util/logger'
import objToVal from '../../util/obj-value'

function tostring(value) {
  var v = objToVal(value)
  return v == undefined ? '' : String(v)
}

function tonumber(value) {
  return Number(objToVal(value))
}

/* 값을 그대로 반환하는 evaluator */
function value(value) {
  return value
}

function valueString(value) {
  return tostring(value)
}

function valueNumber(value) {
  return tonumber(value)
}

/* map에 매핑된 값을 반환하는 evaluator */
function map(value) {
  if (!this.param)
    return

  value = tostring(value)

  if (this.param.hasOwnProperty(value))
    return this.param[value]

  return this.param['default']
}

/* 범위에 매핑된 값을 반환하는 evaluator */
function range(value) {
  var { param } = this

  if (!param)
    return

  for (let range in param) {
    let [from_string, to_string] = range.split('~')
    let from_defined = !!from_string
    let to_defined = !!to_string

    let from = Number(from_string)
    let to = Number(to_string)

    value = tonumber(value)

    // from이나 to 둘 중 하나만 있는 경우 먼저 계산
    if ((from_defined && !to_defined) && value >= from)
      return param[range]
    else if ((!from_defined && to_defined) && value < from)
      return param[range]

    // 소수점이 있으므로  from <= value < to 가 되야함
    if (value >= from && value < to)
      return param[range]
  }

  return param['default']
}

/* degree 값을 radian으로 변환하는 evaluator */
function radian(value) {
  return tonumber(value) * Math.PI / 180
}

function noop() { }

/* 자바스크립트 로직으로 문자열을 evaluator로 변환 */
function build(script) {
  var evaluator

  try {
    eval(`evaluator = function(value, targets) {${script}}`);
    return evaluator
  } catch (e) {
    error(e);
    return noop
  }
}

export default function buildEvaluator(mapping, owner, rule, param, type) {
  switch (rule) {
    case 'value':
      if (type === 'text' || type === 'string')
        return valueString.bind(mapping)
      if (type === 'number')
        return valueNumber.bind(mapping)
      return value.bind(owner)
    case 'map':
      return map.bind(mapping)
    case 'range':
      return range.bind(mapping)
    case 'radian':
      return radian.bind(mapping)
    case 'eval':
      return build(param).bind(owner)
    default:
      return value.bind(owner)
  }
}
