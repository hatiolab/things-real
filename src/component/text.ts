/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'
import * as THREE from 'three'

import { ThrottleSettings } from 'lodash';
import RealObjectMesh from './threed/real-object-mesh';

class ObjectText extends RealObjectMesh {
  private texture: THREE.Texture
  private objectSize: THREE.Vector3 = new THREE.Vector3()

  build() {
    let {
      fontSize = 10,
      text = '',
      bold = false,
      italic = false,
      fontFamily: font = 'serif',
      lineHeight = fontSize * 1.2, // default(line-height: normal) lineHeight
      fontColor = 'black'
    } = this.component.state

    if (!text) {
      this.clear()
      return
    }

    let textBounds = this.getTextBounds({
      fontSize,
      text,
      font,
      bold,
      italic,
      lineHeight
    })

    let width = this.component.state.dimension.width = textBounds.width;
    let height = this.component.state.dimension.height = textBounds.height;

    let canvas = this.createOffcanvas(width, height);
    this.drawTextTexture(canvas, { fontColor, fontSize, font, text, lineHeight, bold, italic });

    this.texture = new THREE.CanvasTexture(canvas)
    this.texture.needsUpdate = true

    super.build()
  }

  clear() {
    // TODO gltf object 리소스 해제가 필요하면, 여기에 추가.
    // 반복적으로 로딩하면 WebGL 리소스 부족으로 오류 발생.
    this.traverse(o => {
      let mesh = o as any;
      if (mesh.isMesh) {
        mesh.geometry.dispose()
        let materials = mesh.material.length ? mesh.material : [mesh.material]
        materials.forEach(m => {
          if (m.dispose)
            m.dispose()
        })
      }
    })

    super.clear()
  }

  buildGeometry() {
    let {
      width = 1,
      height = 1
    } = this.component.state.dimension || Component.UNIT_DIMENSION

    return new THREE.PlaneBufferGeometry(width, height)
  }

  buildMaterial() {
    return new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide
    })

  }
  private getTextBounds(textOption: { fontSize: number; text: string; font: string; bold: boolean; italic: boolean; lineHeight: any; }): { width: number, height: number } {
    let {
      fontSize = 10,
      text = '',
      font = 'serif',
      bold = false,
      italic = false,
      lineHeight = fontSize * 1.2 // default(line-height: normal) lineHeight
    } = textOption

    let span = document.createElement('span')
    span.style.font = `${bold ? 'bold ' : ''}${italic ? 'italic ' : ''}${fontSize}px ${font}`
    span.style.lineHeight = `${lineHeight}px`
    span.style.whiteSpace = 'pre'
    span.style.position = 'absolute'
    span.textContent = text;

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

  private drawTextTexture(canvas: HTMLCanvasElement, {
    fontColor = 'black',
    fontSize = 10,
    font = 'arial',
    text = '',
    lineHeight = fontSize * 1.2,
    bold = false,
    italic = false
  }) {

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

  dispose() {
    super.dispose();
  }

  update() {

    let {
      width = 1,
      height = 1,
      depth = 1
    } = this.component.state.dimension || Component.UNIT_DIMENSION

    let {
      x, y, z
    } = this.objectSize

    /* component 자체의 scale도 별도의 의미가 있으므로, dimension은 하위 pivot object의 scale로 조절한다. */

  }

}

export default class Text extends Component {

  static get type() {
    return 'text'
  }

  buildObject3D() {
    return new ObjectText(this)
  }

  /* url 이 바뀐 경우에는 rebuild 한다. */
  onchangeurl(after, before) {
    (this.object3D as ObjectText).build()
  }
}

Component.register(Text.type, Text)

