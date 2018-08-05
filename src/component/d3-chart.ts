/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import DomComponent from './dom'
import * as d3 from 'd3'

export default abstract class D3Chart extends DomComponent {

  public abstract styleSheet
  public abstract styleSheetId

  installStyleSheet() {
    if (document.querySelector(`#${this.styleSheetId}`)) {
      return
    }

    var styleElement = document.createElement("style");
    styleElement.type = 'text/css'
    styleElement.id = this.styleSheetId

    if (styleElement['styleSheet']) {
      styleElement['styleSheet'].cssText = this.styleSheet
    } else {
      styleElement.appendChild(document.createTextNode(this.styleSheet))
    }

    document.head.appendChild(styleElement);
  }

  createDOMElement() {
    var {
      options = {}
    } = this.state

    var element = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    Object.keys(options).forEach(prop => {
      element[prop] = options[prop]
    })

    this.installStyleSheet()

    return element
  }
}
