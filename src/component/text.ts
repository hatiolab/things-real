/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'
import RealObjectMesh from './threed/real-object-mesh'

import * as THREE from 'three'

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

    let canvas = this.createOffcanvas(width, height)
    this.drawTextTexture(canvas)

    var texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide
    })
  }

  private getTextBounds(): { width: number, height: number } {
    let {
      fontSize = 10,
      text,
      bold = false,
      italic = false,
      fontFamily: font = 'serif',
      lineHeight = fontSize * 1.2, // default(line-height: normal) lineHeight
    } = this.component.state

    if (!text) {
      text = ' '
    }

    let span = document.createElement('span')
    span.style.font = `${bold ? 'bold ' : ''}${italic ? 'italic ' : ''}${fontSize}px ${font}`
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

  private createOffcanvas(width: number, height: number): HTMLCanvasElement {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  private drawTextTexture(canvas: HTMLCanvasElement) {

    let {
      fontSize = 10,
      text,
      bold = false,
      italic = false,
      fontFamily: font = 'serif',
      lineHeight = fontSize * 1.2, // default(line-height: normal) lineHeight
      fontColor = 'black'
    } = this.component.state

    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = fontColor;
    ctx.font = `${bold ? 'bold ' : ''}${italic ? 'italic ' : ''}${fontSize}px ${font}`;
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.strokeStyle = fontColor;
    let lineText = text.split('\n');
    lineText.forEach((t, i) => {
      ctx.fillText(t, 0, Number(i) * lineHeight);
      ctx.strokeText(t, 0, Number(i) * lineHeight);
    });
  }
}

export default class Text extends Component {

  static get type() {
    return 'text'
  }

  buildObject3D() {
    return new ObjectText(this)
  }

  /* text 가 바뀐 경우에는 rebuild 한다. */
  onchangetext(after, before) {
    (this.object3D as ObjectText).build()
  }
}

Component.register(Text.type, Text)

