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

// export function makeTexture(width, height, fillStyle, render) {

//   createFloor(color, width, height) {

//     let fillStyle = this.model.fillStyle

//     var floorMaterial

//     if (fillStyle.type == 'pattern' && fillStyle.image) {

//       var floorTexture = this._textureLoader.load(this.app.url(fillStyle.image), texture => {
//         texture.minFilter = THREE.LinearFilter

//         texture.repeat.set(1, 1)
//         this.render_threed()
//       })

//       var floorMaterial = [
//         new THREE.MeshLambertMaterial({
//           color: color
//         }),
//         new THREE.MeshLambertMaterial({
//           color: color
//         }),
//         new THREE.MeshLambertMaterial({
//           color: color
//         }),
//         new THREE.MeshLambertMaterial({
//           color: color
//         }),
//         new THREE.MeshLambertMaterial({
//           map: floorTexture
//         }),
//         new THREE.MeshLambertMaterial({
//           color: color
//         })
//       ]
//     } else {
//       floorMaterial = new THREE.MeshLambertMaterial({
//         color: color
//       })
//     }

//     var floorGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
//     var floor = new THREE.Mesh(floorGeometry, floorMaterial)

//     floor.scale.set(width, height, 5);
//     floor.rotation.x = -Math.PI / 2
//     floor.position.y = -2

//     floor.name = 'floor'

//     floor.receiveShadow = true;

//     this._scene3d.add(floor)

//     return floor
//   }










//   if (fillStyle == 'none') {
//     return
//   }

//   if (typeof fillStyle == 'string') {
//     // make solid color
//     return
//   }

//   if (fillStyle.type == 'gradient') {
//     // make gradient texture
//     return
//   }

//   if (fillStyle.type == 'pattern' && fillStyle.image) {
//     // make image pattern texture

//     var textureLoader = new THREE.TextureLoader(THREE.DefaultLoadingManager)
//     textureLoader.withCredentials = 'true'
//     textureLoader.crossOrigin = 'use-credentials'
//     // textureLoader.crossOrigin = 'anonymous'

//     let texture = textureLoader.load(fillStyle.image, texture => {
//       texture.minFilter = THREE.LinearFilter
//       render(texture)
//       // this.component.renderer.render_threed()
//     })
//   }
// }
