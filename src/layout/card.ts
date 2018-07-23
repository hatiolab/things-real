/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Layout from './layout'

function getActiveArrayFromContainer(container) {
  var components = container.components.filter(c => !c.hidden)
  var config = container.get('layoutConfig')

  var active = components[(config && config.activeIndex) || 0]

  return (active && [active]) || []
}

/* 대상 컴포넌트의 bounds를 계산한다. */
var CardLayout = {

  reflow: function(container) {
    var container_bounds = container.bounds

    var bounds = {
      left: 0,
      top: 0,
      width: container_bounds.width,
      height: container_bounds.height
    }

    container.forEach(component => {

      component.bounds = bounds
      component.set('rotation', 0)
    })
  },

  capturables: function(container) {
    return getActiveArrayFromContainer(container)
  },

  drawables: function(container) {
    return getActiveArrayFromContainer(container)
  },

  isStuck: function(component) {
    return true
  }
}

Layout.register('card', CardLayout)

export default CardLayout
