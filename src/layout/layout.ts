/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { error } from '../util'

var registry = {}

function register(name, layout) {
  registry[name] = layout
}

function unregister(name) {
  delete registry[name]
}

function get(name) {
  if (!name)
    return

  var layout = registry[name]
  if (!layout)
    error("Layout Not Found - ", name)
  return layout
}

export default {
  register,
  unregister,
  get
}
