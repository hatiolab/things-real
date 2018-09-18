import * as tinycolor from 'tinycolor2'
import * as THREE from 'three'

export function applyAlpha(material: any, alpha, fillStyle) {
  var opacity = 1
  if (!fillStyle || fillStyle == 'none') {
    opacity = alpha
  } else {
    var fillAlpha = typeof fillStyle == 'string' ? tinycolor(fillStyle).getAlpha() : 1
    opacity = alpha * fillAlpha
  }

  material.opacity = opacity
  material.transparent = opacity < 1
}

export function makeTexture(width, height, fillStyle, render) {
  if (fillStyle == 'none') {
    return
  }

  if (typeof fillStyle == 'string') {
    // make solid color
    return
  }

  if (fillStyle.type == 'gradient') {
    // make gradient texture
    return
  }

  if (fillStyle.type == 'pattern' && fillStyle.image) {
    // make image pattern texture

    let texture = (THREE.TextureLoader as any).load(fillStyle.image, texture => {
      texture.minFilter = THREE.LinearFilter
      render(texture)
      // this.component.renderer.render_threed()
    })
  }
}
