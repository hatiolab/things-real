/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Layout from './layout'

function weight(component) {
  var config = component.get('layoutConfig')
  return (!config) ? 1 : (config.weight || 1)
}

/* 대상 컴포넌트의 bounds를 계산한다. */
var LinearVertical = {
  reflow: function(container) {
    var components =　this.drawables(container)

    var padding = container.get("padding") || {}

    var total_weight = components.reduce((total, component) => {
      return total + weight(component)
    }, 0)

    var container_bounds = container.bounds
    var component_height = total_weight > 0
      ? (container_bounds.height - ((padding.top || 0) + (padding.bottom || 0))) / total_weight : container_bounds.height
    var component_width = container_bounds.width - ((padding.left || 0) + (padding.right || 0))

    var cum_weight = 0

    components.forEach((component) => {
      let w = weight(component)
      let margin = component.get('margin') || {}

      component.bounds = {
        left: 0 + (padding.left||0) + (margin.left||0),
        top: component_height * cum_weight + (padding.top||0) + (margin.top||0),
        width: component_width - ((margin.left||0) + (margin.right||0)),
        height: w * component_height - ((margin.top||0) + (margin.bottom||0))
      }

      component.set('rotation', 0)

      cum_weight += w
    })
  },

  capturables: function(container) {
    return container.components
  },

  drawables: function(container) {
    return container.components.filter(c => !c.hidden)
  },

  isStuck: function(component) {
    return true
  }
}

Layout.register('linear-vertical', LinearVertical)

export default LinearVertical
