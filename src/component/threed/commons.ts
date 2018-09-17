import * as tinycolor from 'tinycolor2'

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
