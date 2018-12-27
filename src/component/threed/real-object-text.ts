/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import RealObjectMesh from "./real-object-mesh";

import * as THREE from "three";

import { PIXEL_RATIO, createCanvas } from "../html/elements";

function fontStyle(
  bold: boolean,
  italic: boolean,
  fontSize: number,
  fontFamily: string
): string {
  return [
    ["bold", bold],
    ["italic", italic],
    [fontSize + "px", true],
    [fontFamily, true]
  ]
    .filter(p => p[1])
    .map(p => p[0])
    .join(" ");
}

function nextPowerOf2(n) {
  var count = 0;

  if (n && !(n & (n - 1))) {
    return n;
  }

  while (n != 0) {
    n >>= 1;
    count += 1;
  }

  return 1 << count;
}

/**
 * RealObjectText
 */
export default class RealObjectText extends RealObjectMesh {
  buildGeometry() {
    // TODO component.text의 heavy한 로직을 반복적으로 실행하지 않도록, 캐싱하자.
    var text = this.component.text;
    let { width, height } = this.getTextBounds(text);

    this.component.dimension = {
      width,
      height,
      depth: 1
    };

    return new THREE.PlaneBufferGeometry(width, height);
  }

  buildMaterial() {
    let { width, height } = this.component.state.dimension;

    // TODO component.text의 heavy한 로직을 반복적으로 실행하지 않도록, 캐싱하자.
    var text = this.component.text;

    var poweredWidth = nextPowerOf2(width);
    var poweredHeight = nextPowerOf2(height);

    let canvas = createCanvas(poweredWidth, poweredHeight);

    this.drawTextTexture(canvas, text, width, height);

    var texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 1 - height / poweredHeight);
    texture.repeat.set(width / poweredWidth, height / poweredHeight);
    texture.needsUpdate = true;

    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.2,
      side: THREE.DoubleSide
    });
  }

  private getTextBounds(text: string): { width: number; height: number } {
    let { textStyle = {} } = this.component.state;

    let {
      bold = false,
      italic = false,
      fontFamily = "Serif",
      fontSize = 10,
      lineHeight = "normal"
    } = textStyle;

    if (text === undefined || text == "") {
      text = " ";
    } else {
      text = String(text);
    }

    let span = document.createElement("span");
    span.style.font = fontStyle(bold, italic, fontSize, fontFamily);
    span.style.lineHeight = lineHeight;
    span.style.whiteSpace = "pre";
    span.style.position = "absolute";
    span.textContent = text;

    document.body.appendChild(span);

    let textBounds = span.getBoundingClientRect();

    document.body.removeChild(span);

    return {
      width: textBounds.width,
      height: textBounds.height
    };
  }

  private drawTextTexture(
    canvas: HTMLCanvasElement,
    text: string,
    width: number,
    height: number
  ) {
    var {
      bold = false,
      italic = false,
      fontFamily = "Serif",
      fontSize = 10,
      fontColor = "black"
    } = this.component.state.textStyle || {};

    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    fontSize *= PIXEL_RATIO;

    ctx.clearRect(
      0,
      0,
      canvas.width * PIXEL_RATIO,
      canvas.height * PIXEL_RATIO
    );
    ctx.fillStyle = fontColor;
    ctx.strokeStyle = fontColor;
    ctx.font = fontStyle(bold, italic, fontSize, fontFamily);
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(String(text), 0, 0);

    /* TODO multiline 시 검토 */
    // var lineText = String(text).split('\n')
    // lineText.forEach((t, i) => {
    //   ctx.fillText(t, 0, Number(i) * lineHeight)
    //   ctx.strokeText(t, 0, Number(i) * lineHeight)
    // })
  }

  /* overide */
  updateDimension() {
    // Intentionally do nothing
  }

  updateAlpha() {
    // material의 transparency는 항상 true으로 유지되어야 한다.
    super.updateAlpha();

    (this.material as any).transparent = true;
  }
}
