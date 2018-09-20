/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'
import RealObjectMesh from './threed/real-object-mesh'
import { PIXEL_RATIO, createCanvas } from './html/elements'

import * as THREE from 'three'

function fontStyle(bold: boolean, italic: boolean, fontSize: number, fontFamily: string): string {
  return [
    ['bold', bold],
    ['italic', italic],
    [fontSize + 'px', true],
    [fontFamily, true]
  ].filter(p => p[1]).map(p => p[0]).join(' ')
}

/**
 * ObjectText
 */
class ObjectText extends RealObjectMesh {

  buildGeometry() {

    let { width, height } = this.getTextBounds()

    this.component.dimension = {
      width, height, depth: 1
    }

    return new THREE.PlaneBufferGeometry(width, height)
  }

  buildMaterial() {
    let { width, height } = this.component.state.dimension

    let canvas = createCanvas(width, height)
    this.drawTextTexture(canvas)

    var texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.2,
      side: THREE.DoubleSide
    })
  }

  private getTextBounds(): { width: number, height: number } {
    let {
      textOptions = {},
      textStyle = {}
    } = this.component.state

    let {
      text
    } = textOptions

    let {
      bold = false,
      italic = false,
      fontFamily = 'serif',
      fontSize = 10,
      lineHeight = fontSize * 1.2, // default(line-height: normal) lineHeight
    } = textStyle

    if (text === undefined || text == '') {
      text = ' '
    } else {
      text = String(text)
    }

    let span = document.createElement('span')
    span.style.fontSize = fontSize + 'px'
    span.style.fontFamily = fontFamily
    span.style.fontStyle = italic ? 'italic' : 'normal'
    span.style.fontWeight = bold ? 'bold' : 'normal'
    span.style.lineHeight = `${lineHeight}px`
    span.style.whiteSpace = 'pre'
    span.style.position = 'absolute'
    span.textContent = text

    document.body.appendChild(span)

    let textBounds = span.getBoundingClientRect()

    document.body.removeChild(span)

    return {
      width: textBounds.width,
      height: textBounds.height
    }
  }

  private drawTextTexture(canvas: HTMLCanvasElement) {

    var text = this.component.text
    var {
      bold = false,
      italic = false,
      fontFamily = 'serif',
      fontSize = 10,
      lineHeight = fontSize * 1.2, // default(line-height: normal) lineHeight
      fontColor = 'black'
    } = (this.component.state.textStyle || {})

    var ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    fontSize *= PIXEL_RATIO
    lineHeight *= PIXEL_RATIO

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = fontColor
    ctx.font = fontStyle(bold, italic, fontSize, fontFamily)
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.strokeStyle = fontColor

    var lineText = String(text).split('\n')
    lineText.forEach((t, i) => {
      ctx.fillText(t, 0, Number(i) * lineHeight)
      ctx.strokeText(t, 0, Number(i) * lineHeight)
    })
  }

  updateAlpha() {
    // material의 transparency는 항상 true으로 유지되어야 한다.
    super.updateAlpha();

    (this.material as any).transparent = true
  }
}

export default class Text extends Component {

  static get type() {
    return 'text'
  }

  buildObject3D() {
    return new ObjectText(this)
  }

  get hasTextProperty() {
    return true
  }
}

Component.register(Text.type, Text)

