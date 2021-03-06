/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import buildEvaluator from './evaluator'
import buildAccessor from '../../util/obj-accessor'

function propType(property) {
  switch (property) {
    // case 'text':
    // case 'fontColor':
    case 'ref':
    case 'fillStyle':
    case 'strokeStyle':
      return 'string';
    // case 'value':
    // case 'rotation':
    // return 'number';
    default:
      return
  }
}

export default class DataSpreadRule {
  constructor(model, owner) {
    this.owner = owner
    this.model = model
  }

  private owner

  private _model = {}
  private _evaluator
  private _accessor

  get model() {
    return this._model
  }

  set model(model: any) {
    var { property, rule, param, accessor } = model

    this._model = model

    this._evaluator = buildEvaluator(this, this.owner, rule, param, propType(property))
    this._accessor = buildAccessor(accessor)
  }

  get target() {
    return this.model.target
  }

  get property() {
    return this.model.property
  }

  get param() {
    return this.model.param
  }

  get accessor() {
    return this._accessor
  }

  get evaluator() {
    return this._evaluator
  }
}
